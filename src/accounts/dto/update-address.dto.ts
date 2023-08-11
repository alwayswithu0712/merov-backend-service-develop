import { Prisma } from '@prisma/client';

export class UpdateAddressDto implements Prisma.AddressUpdateInput {
    name: string
    street: string
    city: string
    state: string
    country: string
    postcode: string
    phone: string
}
