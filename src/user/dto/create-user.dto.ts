import { Prisma } from '@prisma/client';
export class CreateUserDto {
    authId: Prisma.UserCreateInput['authId'];
    email: Prisma.UserCreateInput['email'];
    name: Prisma.AccountCreateInput['name'];
    referral: string;
    invitation?: string;
    userId: Prisma.UserCreateInput['id'];
    accountId: Prisma.UserUncheckedCreateInput['accountId'];
    organization?: {
        name: string;
        taxId: string;
        address: string;
        website: string;
    };
};
