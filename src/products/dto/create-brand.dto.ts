import { Prisma } from '@prisma/client';


export class CreateBrandDto implements Prisma.BrandCreateInput {
    id?: string
    categoryId: string
    subcategoryId: string
    name: string
    approved?: boolean
}
