import { Prisma } from '@prisma/client';

type CreateProductsType = Omit<Prisma.ProductUncheckedCreateInput, 'id' | 'sellerId'> & {
    categoryId: string;
    subcategoryId: string;
    deliveryAddressId: string;
};

export class CreateProductsDto implements CreateProductsType {
    title: string;
    description: string;
    price: number;
    priceInUsd?: number | null;
    images?: string[];
    condition: string;
    stock?: number;
    sellerAddress: string;
    brand?: string | null;
    model?: string | null;
    currency: string;
    chain: string;
    shippingCost?: number;
    weight?: number | null;
    weightUnit?: string | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
    dimensionsUnit?: string | null;
    maxTestingTime?: number | null;
    minTestingTime?: number | null;
    requiresShipping?: boolean;
    approved?: boolean;
    published?: boolean;
    featured?: boolean;
    deleted?: boolean;
    categoryId: string;
    subcategoryId: string;
    deliveryAddressId: string;
}
