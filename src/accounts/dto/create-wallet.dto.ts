import { Prisma } from '@prisma/client';
export class CreateWalletDto implements Omit<Prisma.WalletCreateInput, 'account'> {
    name: string
    address: string
    chain: string
}

