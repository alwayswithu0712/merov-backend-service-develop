import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Offer as PrismaOffer, OfferStatus, Prisma, PrismaPromise, VisibilityStatus } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { PrismaService } from '../shared/services/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { CreateOfferDto } from './dto/create-offers.dto';
import { generateId } from '../shared/helpers/id';
import { PaginatedResponse, toPaginatedResponse } from '../shared/typings/paginatedResponse';
import { Offer } from './dto/offer';

@Injectable()
export class OffersService {
    constructor(
        private readonly accountsService: AccountsService,
        private readonly prisma: PrismaService,
        private readonly productsService: ProductsService,
    ) {}

    private readonly logger = new Logger(OffersService.name);

    async create(offerDto: CreateOfferDto, accountId: string): Promise<Offer> {
        const { productId } = offerDto;

        const product = await this.productsService.getById(productId);
        if (!product.approved) throw new BadRequestException(`Product is not approved`);
        if (product.stock < offerDto.quantity) throw new BadRequestException(`Offer stock cannot be greater than the product stock`);
        if (product.seller.id !== accountId) throw new BadRequestException(`Offer can only be created by the owner of the product`);

        const account = await this.accountsService.getById(accountId);

        if (!account) {
            throw new NotFoundException(`Account not found`);
        }

        if (offerDto.visibility === VisibilityStatus.Private && offerDto.sharedWith.length === 0) {
            throw new BadRequestException(`A private offer has to be shared with a user`);
        }

        const id = generateId();

        delete offerDto.productId;

        const offerCreateInput: Prisma.OfferCreateInput = {
            ...offerDto,
            id,
            sellerAddress: product.sellerAddress,
            status: OfferStatus.Active,
            url: `${process.env.MEROV_DOMAIN}/offers/${id}?r=${account.name}`,
            product: {
                connect: {
                    id: productId,
                },
            },
            seller: {
                connect: {
                    id: account.id,
                },
            },
        };

        const prismaOffer = await this.prisma.offer.create({
            data: offerCreateInput,
        });

        return new Offer(prismaOffer);
    }

    async getById(id: string): Promise<Offer> {
        const prismaOffer = await this.prisma.offer.findUnique({
            where: {
                id,
            },
            include: {
                seller: true,
                product: true,
            },
        });

        if (!prismaOffer) {
            throw new NotFoundException(`Offer not found`);
        }

        return new Offer(prismaOffer);
    }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handleCron() {
        const offers = await this.prisma.offer.findMany();

        for (const offer of offers) {
            if (new Date() > new Date(offer.expirationDate)) {
                await this.update(offer.id, { status: OfferStatus.Expired });
            }
        }
    }

    updateOfferStock(id: string, stock: number): PrismaPromise<PrismaOffer> {
        const data = stock <= 0 ? { quantity: 0, status: OfferStatus.Expired } : { quantity: stock };

        return this.prisma.offer.update({
            where: {
                id,
            },
            data,
        });
    }

    async findAll(params): Promise<PaginatedResponse<Offer>> {
        const count = await this.prisma.offer.count({
            where: params.where,
        });
        const offers = await this.prisma.offer.findMany({
            ...params,

            include: { seller: true, orders: true, product: true },
        });
        return toPaginatedResponse(offers.map(o => new Offer(o)), count, params.skip, params.take);
    }

    async update(id: string, data: Prisma.OfferUpdateInput): Promise<Offer> {
        const prismaOffer = await this.prisma.offer.update({
            where: {
                id,
            },
            data,
        });

        return new Offer(prismaOffer);
    }
}
