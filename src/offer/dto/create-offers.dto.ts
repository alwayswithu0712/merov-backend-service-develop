import { Prisma, VisibilityStatus } from '@prisma/client';


export class CreateOfferDto implements Partial<Prisma.OfferUncheckedCreateInput> {
    productId: string
    price: number
    shippingCost?: number
    currency: string
    chain: string
    sellerAddress: string
    quantity?: number
    minTestingTime?: number | null
    maxTestingTime?: number | null
    visibility: VisibilityStatus
    expirationDate?: Date | string | null
    sharedWith?: string | null
}
