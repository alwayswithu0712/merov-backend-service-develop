import {
    Chat as PrismaChat,
    Offer as PrismaOffer,
    Order as PrismaOrder,
    OrderReview as PrismaOrderReview,
    Product as PrismaProduct,
    Account as PrismaAccount,
    Dispute as PrismaDispute,
    OrderStatus
} from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { Chat } from '../../chats/dto/chat';
import { Offer } from '../../offer/dto/offer';
import { MEROV_ADMIN } from '../../shared/typings/groups';
import { Product } from '../../products/dto/product';
import { Account } from '../../accounts/dto/account.dto';
import OrderValidator from '../orders.validator';
import { Dispute } from './dispute';
import { Review } from './review';

export interface FullPrismaOrder extends PrismaOrder {
    buyer: PrismaAccount;
    seller: PrismaAccount;
    product: PrismaProduct;
    reviews: PrismaOrderReview[];
    dispute: PrismaDispute;
    offer: PrismaOffer;
    chat: PrismaChat;
}

export class Order implements PrismaOrder {
    id: string;
    createdAt: Date;
    acceptedAt: Date;
    paidAt: Date;
    shippedAt: Date;
    deliveredAt: Date;
    refundedAt: Date;
    disputedAt: Date;
    completedAt: Date;
    closedAt: Date;
    status: OrderStatus;
    escrowAddress: string;
    priceUSD: number;
    shippingCostUSD: number;
    totalUSD: number;
    price: number;
    quantity: number;
    chain: string;
    currency: string;
    total: number;
    trackingNumber: string;
    shippingCost: number;
    maxShippingDurationInDays: number;
    maxTimeToDisputeInDays: number;
    minTestingTime: number;
    maxTestingTime: number;
    shippingToCity: string;
    shippingToCountry: string;
    shippingToPostcode: string;
    shippingToAddressName: string;
    shippingToState: string;
    shippingToStreet: string;
    sellerNotes: string;
    disputeReason: string;

    productId: string;
    buyerId: string;
    sellerId: string;
    offerId: string;
    chatId: string;
    disputeId: number;

    isDisputable: boolean;
    isActive: boolean;
    isCloseable: boolean;

    @Exclude() shippingFromAddressName: string;
    @Exclude() shippingFromCity: string;
    @Exclude() shippingFromCountry: string;
    @Exclude() shippingFromPostcode: string;
    @Exclude() shippingFromState: string;
    @Exclude() shippingFromStreet: string;

    @Expose({ groups: [MEROV_ADMIN] }) buyerPhone: string;
    @Expose({ groups: [MEROV_ADMIN] }) sellerPhone: string;
    @Expose({ groups: [MEROV_ADMIN] }) payinTxHash: string;
    @Expose({ groups: [MEROV_ADMIN] }) payoutTxHash: string;
    @Expose({ groups: [MEROV_ADMIN] }) buyerAddress: string;
    @Expose({ groups: [MEROV_ADMIN] }) sellerAddress: string;
    @Expose({ groups: [MEROV_ADMIN] }) escrowId: number;
    @Expose({ groups: [MEROV_ADMIN] }) updatedAt: Date;
    @Expose({ groups: [MEROV_ADMIN] }) failedAt: Date;

    @Type(() => Account) buyer: Account;
    @Type(() => Account) seller: Account;
    @Type(() => Product) product: Product;
    @Type(() => Dispute) dispute: Dispute;
    @Type(() => Review) reviews: Review[];

    @Exclude({ toPlainOnly: true }) offer: Offer;
    @Exclude({ toPlainOnly: true }) chat: Chat;

    

    constructor(partial: Partial<FullPrismaOrder>) {
        Object.assign(this, partial);

        this.isDisputable = OrderValidator.isDisputable(partial.status);
        this.isCloseable = OrderValidator.isCloseable(partial.status);
        this.isActive = OrderValidator.isActive(partial.status);
    }
}
