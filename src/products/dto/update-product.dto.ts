import { Prisma } from '@prisma/client';


export class UpdateProductsDto implements Prisma.ProductUpdateInput {
    id?: string;
    createdAt?: Date | string;
    title?: string;
    description?: string;
    price?: number;
    priceInUsd?: number | null;
    images?: string[];
    condition?: string;
    stock?: number;
    sellerAddress?: string;
    brand?: string | null;
    model?: string | null;
    currency?: string;
    chain?: string;
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
}
