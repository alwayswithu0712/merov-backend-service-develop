import { Account as PrismaAccount, Category, Offer, Order, OrderStatus, Product as PrismaProduct, Subcategory } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { Account } from '../../accounts/dto/account.dto';
import { MEROV_ADMIN, ME } from '../../shared/typings/groups';
import OrderValidator from '../../orders/orders.validator';
import { DimensionUnit, WeightUnit } from '../../shared/typings/units';

export interface FullPrismaProduct extends PrismaProduct {
    category: Category;
    subcategory: Subcategory;
    seller: PrismaAccount;
    offers: Offer[]
    orders: Order[];
}
export class Product implements PrismaProduct {
    id: string;
    createdAt: Date;
    title: string;
    description: string;
    price: number;
    priceInUsd: number;
    images: string[];
    condition: string;
    stock: number;
    sellerId: string;
    brand: string;
    model: string;
    currency: string;
    chain: string;
    categoryId: string;
    subcategoryId: string;
    deliveryAddressId: string;
    shippingCost: number;
    maxTestingTime: number;
    minTestingTime: number;
    requiresShipping: boolean;

    weight: number;
    weightUnit: WeightUnit;
    length: number;
    width: number;
    height: number;
    dimensionsUnit: DimensionUnit;

    category: Category;
    subcategory: Subcategory;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    sellerAddress: string;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    approved: boolean;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    published: boolean;

    @Expose({ groups: [MEROV_ADMIN] })
    featured: boolean;

    @Expose({ groups: [MEROV_ADMIN] })
    deleted: boolean;

    @Type(() => Account)
    seller: Account;

    @Exclude({ toPlainOnly: true })
    offers: Offer[];

    @Exclude({ toPlainOnly: true })
    orders: Order[];

    @Expose({ groups: [MEROV_ADMIN, ME] })
    isRemovable: boolean;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    activeOrdersCount: number;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    itemsSoldCount: number;

    constructor(partial: Partial<FullPrismaProduct>) {
        Object.assign(this, partial);

        this.isRemovable = !partial.orders || partial.orders?.length === 0;
        this.activeOrdersCount = partial.orders?.filter(order => OrderValidator.activeStatusList.includes(order.status)).length || 0;
        this.itemsSoldCount = partial.orders?.filter(order => order.status === OrderStatus.Completed).reduce((acc, order) => acc + order.quantity, 0) || 0;
    }


}
