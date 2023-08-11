import { Prisma } from '@prisma/client';

export class UpdateAccountDto implements Prisma.AccountUpdateInput {}

export class UpdateAccountMeDto implements Prisma.AccountUpdateInput {
    avatarUrl?: string
}
