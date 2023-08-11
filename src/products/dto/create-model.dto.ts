import { Prisma } from '@prisma/client';

export class CreateModelDto implements Prisma.ModelCreateInput {
    id?: string
    categoryId: string
    subcategoryId: string
    brand: string
    name: string
    approved?: boolean
}

