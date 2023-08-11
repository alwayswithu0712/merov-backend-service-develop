import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, Prisma, PrismaPromise, Order as PrismaOrder, OrderUpdate } from '@prisma/client';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CurrenciesService } from '../currencies/currencies.service';
import { ProductsService } from '../products/products.service';
import { ErbnService } from '../shared/services/erbn.service';
import { PrismaService } from '../shared/services/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './dto/order';
import { OffersService } from '../offer/offers.service';
import { generateId } from '../shared/helpers/id';
import { ChatService } from '../chats/chats.service';
import OrderValidator from './orders.validator';
import { PaginatedResponse, toPaginatedResponse } from '../shared/typings/paginatedResponse';
import { MerovConfig } from '../config/config.interface';
import { EscrowEvents } from '../webhooks/events/escrow.events';
import { AddressesService } from '../accounts/addresses.service';
import * as moment from 'moment';

const include = {
    product: {
        include: {
            category: true,
            subcategory: true,
        },
    },
    seller: true,
    buyer: true,
    reviews: true,
    offer: true,
    dispute: true,
    chat: true,
};

@Injectable()
export class OrderService {
    constructor(
        private configService: ConfigService,
        private currenciesService: CurrenciesService,
        private erbnService: ErbnService,
        private addressesService: AddressesService,
        private productService: ProductsService,
        private prisma: PrismaService,
        private offerService: OffersService,
        private chatService: ChatService,
        private eventEmitter: EventEmitter2,
    ) {}
    private readonly logger = new Logger(OrderService.name);

    async createFromProduct(createOrderDto: CreateOrderDto, buyerId: string): Promise<Order> {
        const product = await this.productService.getById(createOrderDto.productId);

        if (!product) {
            throw new NotFoundException(`Product with id ${createOrderDto.productId} not found`);
        }

        if (buyerId === product.sellerId) {
            throw new BadRequestException(`You cannot buy your own product`);
        }

        if (createOrderDto.quantity > product.stock) {
            throw new NotFoundException(`Product with id ${createOrderDto.productId} has only ${product.stock}/${createOrderDto.quantity}`);
        }

        const toDeliveryAddress = await this.addressesService.getById(createOrderDto.deliveryAddressId);

        if (toDeliveryAddress.accountId !== buyerId) {
            throw new NotFoundException(`Delivery address with id ${createOrderDto.deliveryAddressId} is not owned by buyer`);
        }

        const fromDeliveryAddress = await this.addressesService.getById(product.deliveryAddressId);

        if (fromDeliveryAddress.accountId !== product.sellerId) {
            throw new NotFoundException(`Delivery address with id ${product.deliveryAddressId} is not owned by seller`);
        }

        const rate = await this.currenciesService.getPrice(product.currency);

        const newProductStock = product.stock - createOrderDto.quantity;

        const updateProductStockPromise = this.productService.getUpdatePromise(product.id, { stock: newProductStock });

        const updateOfferStockPromises = product.offers.length
            ? product.offers
                  .map((offer) => {
                      if (newProductStock <= offer.quantity) {
                          return this.offerService.updateOfferStock(offer.id, newProductStock);
                      }
                  })
                  .filter((p) => p)
            : [];

        const chat = await this.chatService.getOrCreateChat(createOrderDto, buyerId);

        const createOrderPromise = this.createOrderDb(
            {
                quantity: createOrderDto.quantity,
                chain: product.chain,
                currency: product.currency,
                price: product.price,
                priceUSD: product.price * rate,
                total: createOrderDto.quantity * product.price + product.shippingCost,
                totalUSD: (createOrderDto.quantity * product.price + product.shippingCost) * rate,
                maxTestingTime: product.maxTestingTime,
                sellerAddress: product.sellerAddress,

                shippingFromAddressName: fromDeliveryAddress ? fromDeliveryAddress.name : "",
                shippingFromStreet: fromDeliveryAddress ? fromDeliveryAddress.street : "", 
                shippingFromCity: fromDeliveryAddress ? fromDeliveryAddress.city : "", 
                shippingFromState: fromDeliveryAddress ? fromDeliveryAddress.state : "",  
                shippingFromCountry: fromDeliveryAddress ? fromDeliveryAddress.country : "", 
                shippingFromPostcode: fromDeliveryAddress ? fromDeliveryAddress.postcode : "",  
                sellerPhone: fromDeliveryAddress ? fromDeliveryAddress.phone : "", 

                shippingToAddressName: toDeliveryAddress.name,
                shippingToStreet: toDeliveryAddress.street,
                shippingToCity: toDeliveryAddress.city,
                shippingToState: toDeliveryAddress.state,
                shippingToCountry: toDeliveryAddress.country,
                shippingToPostcode: toDeliveryAddress.postcode,
                buyerPhone: toDeliveryAddress.phone,
            },
            { productId: product.id, sellerId: product.sellerId, buyerId, chatId: chat.id },
        );

        const [prismaOrder] = await this.prisma.$transaction([createOrderPromise, updateProductStockPromise, ...updateOfferStockPromises]);

        const order = new Order(prismaOrder);

        await this.notify(order);

        return order;
    }

    public async createFromOffer(createOrderDto: CreateOrderDto, buyerId: string): Promise<Order> {
        const offer = await this.offerService.getById(createOrderDto.offerId);

        if (createOrderDto.quantity > offer.product?.stock || createOrderDto.quantity > offer?.quantity) {
            throw new NotFoundException(
                `Product with id ${offer.productId} has only ${offer.product?.stock || offer?.quantity}/${createOrderDto.quantity}`,
            );
        }

        const toDeliveryAddress = await this.addressesService.getById(createOrderDto.deliveryAddressId);

        if (toDeliveryAddress.accountId !== buyerId) {
            throw new NotFoundException(`Delivery address with id ${createOrderDto.deliveryAddressId} is not owned by buyer`);
        }

        const fromDeliveryAddress = await this.addressesService.getById(offer.product.deliveryAddressId);

        if (fromDeliveryAddress.accountId !== offer.product.sellerId) {
            throw new NotFoundException(`Delivery address with id ${offer.product.deliveryAddressId} is not owned by seller`);
        }

        if (buyerId === offer?.sellerId) {
            throw new BadRequestException(`You cannot buy your own offer`);
        }

        const product = await this.productService.getById(offer.productId);

        const rate = await this.currenciesService.getPrice(offer?.product.currency);

        const newProductStock = product.stock - createOrderDto.quantity;

        const updateOfferStockPromise = this.offerService.updateOfferStock(offer.id, offer.quantity - createOrderDto.quantity);

        const updateOtherOffersStockPromises = product.offers.length
            ? product.offers
                  .filter((o) => o.id !== offer.id)
                  .map((offer) => {
                      if (newProductStock <= offer.quantity) {
                          return this.offerService.updateOfferStock(offer.id, newProductStock);
                      }
                  })
                  .filter((p) => p)
            : [];

        const updateProductStockPromise = this.productService.getUpdatePromise(offer.product.id, { stock: newProductStock });

        const chat = await this.chatService.getOrCreateChat(createOrderDto, buyerId);

        const createOrderPromise = this.createOrderDb(
            {
                quantity: createOrderDto.quantity,
                chain: offer.product.chain,
                currency: offer.product.currency,
                price: offer.price,
                priceUSD: offer.price * rate,
                total: createOrderDto.quantity * offer.price + offer.shippingCost,
                totalUSD: (createOrderDto.quantity * offer.price + offer.shippingCost) * rate,
                maxTestingTime: offer.product.maxTestingTime,              
                sellerAddress: offer.product.sellerAddress,
                
                shippingFromAddressName: fromDeliveryAddress.name,
                shippingFromStreet: fromDeliveryAddress.street,
                shippingFromCity: fromDeliveryAddress.city,
                shippingFromState: fromDeliveryAddress.state,
                shippingFromCountry: fromDeliveryAddress.country,
                shippingFromPostcode: fromDeliveryAddress.postcode,
                sellerPhone: fromDeliveryAddress.phone,

                shippingToAddressName: toDeliveryAddress.name,
                shippingToStreet: toDeliveryAddress.street,
                shippingToCity: toDeliveryAddress.city,
                shippingToState: toDeliveryAddress.state,
                shippingToCountry: toDeliveryAddress.country,
                shippingToPostcode: toDeliveryAddress.postcode,
                buyerPhone: toDeliveryAddress.phone,

                status: OrderStatus.Accepted,
            },
            { productId: offer.productId, sellerId: offer.sellerId, buyerId, offerId: offer.id, chatId: chat.id },
        );

        const [prismaOrder] = await this.prisma.$transaction([
            createOrderPromise,
            updateOfferStockPromise,
            updateProductStockPromise,
            ...updateOtherOffersStockPromises,
        ]);

        const order = new Order(prismaOrder);

        await this.notify(order);

        return order;
    }

    private createOrderDb(
        createOrderDto,
        entityIds: { productId: string; sellerId: string; buyerId: string; chatId: string; offerId?: string },
    ): PrismaPromise<PrismaOrder> {
        let data = {
            ...createOrderDto,
            id: generateId(),
            maxTimeToDisputeInDays: 7,
            maxShippingDurationInDays: 7,
            status: OrderStatus.Created,
            product: {
                connect: {
                    id: entityIds.productId,
                },
            },
            seller: {
                connect: {
                    id: entityIds.sellerId,
                },
            },

            buyer: {
                connect: {
                    id: entityIds.buyerId,
                },
            },
            chat: {
                connect: {
                    id: entityIds.chatId,
                },
            },
        };

        if (entityIds.offerId) {
            data = {
                ...data,
                offer: {
                    connect: {
                        id: entityIds.offerId,
                    },
                },
            };
        }

        return this.prisma.order.create({
            data,
            include,
        });
    }

    public async getById(id: string): Promise<Order> {
        const order = await this.prisma.order.findUnique({
            where: {
                id,
            },
            include,
        });

        if (!order) throw new NotFoundException(`Order with id ${id} not found`);

        return new Order(order);
    }

    public async findAll(params: {
        where?: Prisma.OrderWhereInput;
        orderBy?: Prisma.OrderOrderByWithRelationAndSearchRelevanceInput;
        skip?: number;
        take?: number;
    }): Promise<PaginatedResponse<Order>> {
        const count = await this.prisma.order.count({
            where: params.where,
        });
        const orders = await this.prisma.order.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            ...params,
            include,
        });

        return toPaginatedResponse(
            orders.map((o) => new Order(o)),
            count,
            params.skip,
            params.take,
        );
    }

    public async update(orderOrId: Order | string, orderUpdate: UpdateOrderDto): Promise<Order> {
        const order = typeof orderOrId === 'string' ? await this.getById(orderOrId) : orderOrId;
        if (!OrderValidator.validFrom[order.status].includes(orderUpdate.status)) {
            throw new BadRequestException(`Order status ${orderUpdate.status} is not valid for order status ${order.status}`);
        }

        let orderDto;
        switch (orderUpdate.status) {
            case OrderStatus.Accepted:
                orderDto = await this.handleOrderAccepted(order, orderUpdate);
                break;
            case OrderStatus.Paid:
                orderDto = await this.handleOrderPaid(order, orderUpdate);
                break;
            case OrderStatus.Shipped:
                orderDto = await this.handleOrderShipped(order, orderUpdate);
                break;
            case OrderStatus.Delivered:
                orderDto = await this.handleOrderDelivered(order, orderUpdate);
                break;
            case OrderStatus.Closed:
                orderDto = await this.handleOrderClosed(order, orderUpdate);
                break;
            case OrderStatus.Disputed:
                orderDto = await this.handleOrderDisputed(order, orderUpdate);
                break;
            case OrderStatus.Refunded:
                orderDto = await this.handleOrderRefunded(order, orderUpdate);
                break;
            case OrderStatus.Completed:
                orderDto = await this.handleOrderCompleted(order, orderUpdate);
                break;
            default:
                throw new BadRequestException(`Order status ${orderUpdate.status} is not valid`);
        }

        await this.notify(orderDto);

        return orderDto;
    }

    private async getByEscrowId(escrowId: number): Promise<Order> {
        const order = await this.prisma.order.findUnique({
            where: {
                escrowId,
            },
            include,
        });

        if (!order) {
            throw new NotFoundException(`Order with escrowId ${escrowId} not found`);
        }

        return new Order(order);
    }

    private async restockOrder(orderDto: Order) {
        const product = await this.productService.getById(orderDto.productId);

        if (!product) throw new NotFoundException(`Could not restock order, product not found`);

        return this.productService.getUpdatePromise(product.id, { stock: product.stock + orderDto.quantity });
    }

    /////////////// HANDLERS //////////////////

    private async handleOrderAccepted(order: Order, orderUpdate: UpdateOrderDto): Promise<Order> {
        const product = await this.productService.getById(order.productId);

        const rate = await this.currenciesService.getPrice(product.currency);
        const updatedShppingCost = orderUpdate.shippingCost ? Number(orderUpdate.shippingCost) : Number(order.shippingCost);
        const updatedTotal = order.quantity * order.price + updatedShppingCost;
        const updatedShippingCostUSD = updatedShppingCost * rate;
        const updatedTotalUSD = updatedTotal * rate;

        const escrow = await this.erbnService.createEscrow(order.chain, updatedTotal, order.currency, product.sellerAddress);

        if (!escrow) {
            throw new BadRequestException(`Could not create escrow for order with id ${order.id}`);
        }

        const data = {
            status: orderUpdate.status,
            acceptedAt: new Date(),
            maxShippingDurationInDays:
                orderUpdate.maxShippingDurationInDays ||
                this.configService.get<MerovConfig>('merov').order.defaultMaxShippingDurationInDays,
            sellerNotes: orderUpdate.sellerNotes,
            shippingCost: updatedShppingCost,
            shippingCostUSD: updatedShippingCostUSD,
            total: updatedTotal,
            totalUSD: updatedTotalUSD,
            escrowId: escrow.id,
            escrowAddress: escrow.address,
        };

        const prismaOrder = await this.prisma.order.update({
            where: {
                id: order.id,
            },
            include,
            data,
        });

        return new Order(prismaOrder);
    }

    private async handleOrderDisputed(orderDto: Order, orderUpdate: UpdateOrderDto): Promise<Order> {
        const prismaOrder = await this.prisma.order.update({
            where: {
                id: orderDto.id,
            },
            data: {
                status: orderUpdate.status,
                disputeReason: orderUpdate.disputeReason,
                disputedAt: new Date(),
                dispute: {
                    create: {
                        id: generateId(),
                        reason: orderUpdate.disputeReason as string,
                    },
                },
            },
            include: {
                ...include,
                dispute: true,
            },
        });

        return new Order(prismaOrder);
    }

    private async handleOrderPaid(orderDto: Order, orderUpdate: UpdateOrderDto): Promise<Order> {
        const data = { status: orderUpdate.status, buyerAddress: orderUpdate.buyerAddress, paidAt: new Date() };

        const prismaOrder = await this.prisma.order.update({
            where: {
                id: orderDto.id,
            },
            data,
            include,
        });

        return new Order(prismaOrder);
    }

    private async handleOrderShipped(orderDto: Order, orderUpdate: UpdateOrderDto): Promise<Order> {
        const data = {
            status: orderUpdate.status,
            shippedAt: new Date(),
            trackingNumber: orderUpdate.trackingNumber,
        };

        const prismaOrder = await this.prisma.order.update({
            where: {
                id: orderDto.id,
            },
            data,
            include,
        });

        return new Order(prismaOrder);
    }

    private async handleOrderDelivered(orderDto: Order, orderUpdate: UpdateOrderDto): Promise<Order> {
        const data = {
            status: orderUpdate.status,
            deliveredAt: new Date(),
        };

        const prismaOrder = await this.prisma.order.update({
            where: {
                id: orderDto.id,
            },
            data,
            include,
        });

        return new Order(prismaOrder);
    }

    private async handleOrderCompleted(orderDto: Order, orderUpdate: UpdateOrderDto): Promise<Order> {
        const txHash = await this.erbnService.releaseEscrow(orderDto.escrowId);

        const data = txHash
            ? {
                  status: orderUpdate.status,
                  completedAt: new Date(),
                  payoutTxHash: txHash,
              }
            : {
                  status: OrderStatus.EscrowPaymentFailed,
                  failedAt: new Date(),
              };

        const prismaOrder = await this.prisma.order.update({
            where: {
                id: orderDto.id,
            },
            data,
            include,
        });

        if (!txHash) throw new NotFoundException(`Could not release escrow for order with id ${prismaOrder.id}`);

        return new Order(prismaOrder);
    }

    private async handleOrderClosed(orderDto: Order, orderUpdate: UpdateOrderDto): Promise<Order> {
        if (orderDto.status === OrderStatus.Paid) {
            return this.handleOrderRefunded(orderDto, { status: OrderStatus.Refunded });
        }

        if (orderDto.escrowId) {
            await this.erbnService.closeEscrow(orderDto.escrowId);
        }

        await this.restockOrder(orderDto);

        const data = {
            status: orderUpdate.status,
            closedAt: new Date(),
        };

        const prismaOrder = await this.prisma.order.update({
            where: {
                id: orderDto.id,
            },
            data,
            include,
        });

        return new Order(prismaOrder);
    }

    private async handleOrderRefunded(orderDto: Order, orderUpdate: UpdateOrderDto): Promise<Order> {
        const txHash = await this.erbnService.refundEscrow(orderDto.escrowId);

        await this.restockOrder(orderDto);

        const data = txHash
            ? {
                  status: orderUpdate.status,
                  refundedAt: new Date(),
                  payoutTxHash: txHash,
              }
            : {
                  status: OrderStatus.EscrowPaymentFailed,
                  failedAt: new Date(),
              };

        const prismaOrder = await this.prisma.order.update({
            where: {
                id: orderDto.id,
            },
            data,
            include,
        });

        if (!txHash) throw new NotFoundException(`Could not refund escrow for order with id ${prismaOrder.id}`);

        return new Order(prismaOrder);
    }

    @OnEvent(EscrowEvents.EscrowPaid)
    async handleEscrowPaidEvent(data: { escrowId: number; hash: string; payerAddress: string }): Promise<void> {
        const { escrowId, hash, payerAddress } = data;

        const order = await this.getByEscrowId(escrowId);

        if (!order) {
            this.logger.error(`Hook was called for an unknown escrow ${escrowId}`);
            return;
        }

        await this.update(order.id, { status: OrderStatus.Paid, payinTxHash: hash, buyerAddress: payerAddress });
    }

    public async getOrderHistory(orderId: string): Promise<OrderUpdate[]> {
        const history = await this.prisma.orderUpdate.findMany({
            where: {
                orderId,
            },
        });

        return history;
    }

    public async getTotalValueTransactedThisMonth(accountId: string): Promise<number> {
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();

        const [ordersAsBuyer, ordersAsSeller] = await Promise.all([
            this.prisma.order.findMany({
                where: {
                    status: {
                        in: [
                            OrderStatus.Created,
                            OrderStatus.Accepted,
                            OrderStatus.Delivered,
                            OrderStatus.Paid,
                            OrderStatus.Shipped,
                            OrderStatus.Disputed,
                            OrderStatus.EscrowPaymentFailed,
                            OrderStatus.Completed,
                        ],
                    },
                    buyerId: accountId,
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            }),
            this.prisma.order.findMany({
                where: {
                    status: {
                        in: [
                            OrderStatus.Accepted,
                            OrderStatus.Delivered,
                            OrderStatus.Paid,
                            OrderStatus.Shipped,
                            OrderStatus.Disputed,
                            OrderStatus.EscrowPaymentFailed,
                            OrderStatus.Completed,
                        ],
                    },
                    sellerId: accountId,
                    acceptedAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            }),
        ]);

        const totalBought = ordersAsBuyer.reduce((acc, order) => acc + order.totalUSD, 0);
        const totalSold = ordersAsSeller.reduce((acc, order) => acc + order.totalUSD, 0);

        return totalBought + totalSold;
    }

    /////////////// END HANDLERS //////////////////

    public static filters = {
        byUser: (accountId: string): Prisma.OrderWhereInput => ({
            OR: [
                {
                    buyerId: accountId,
                },
                {
                    sellerId: accountId,
                },
            ],
        }),
        byActive: (): Prisma.OrderWhereInput => ({
            status: { in: OrderValidator.activeStatusList },
        }),
        byCompleted: (): Prisma.OrderWhereInput => ({
            status: { in: OrderValidator.completedStatusList },
        }),
    };

    private async notify(order: Order) {
        this.eventEmitter.emit(`order.${order.status.toLowerCase()}`, order);
    }
}
