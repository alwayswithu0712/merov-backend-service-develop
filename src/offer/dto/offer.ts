import { Offer as PrismaOffer, Account as PrismaAccount, Product as PrismaProduct, OfferStatus, VisibilityStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { MEROV_ADMIN } from '../../shared/typings/groups';
import { Product } from '../../products/dto/product';
import { Account } from '../../accounts/dto/account.dto';

interface FullPrismaOffer extends PrismaOffer {
    product: PrismaProduct;
    seller: PrismaAccount;
    url: string;
}

export class Offer implements PrismaOffer {
    id: string;
    createdAt: Date;
    price: number;
    shippingCost: number;
    expirationDate: Date;
    minTestingTime: number;
    maxTestingTime: number;
    visibility: VisibilityStatus;
    sellerId: string;
    productId: string;
    quantity: number;
    sharedWith: string;
    status: OfferStatus;

    currency: string;
    chain: string;
    url: string;

    @Expose({ groups: [MEROV_ADMIN] }) sellerAddress: string;
    @Type(() => Account) seller: Account;
    @Type(() => Product) product: Product;

    constructor(partial: Partial<FullPrismaOffer>) {
        Object.assign(this, partial);
    }
}
