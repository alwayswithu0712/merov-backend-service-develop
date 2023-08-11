import { Prisma, IdentityVerificationStatus } from '@prisma/client';

export class UpdateUserDto implements Prisma.UserUpdateInput {
    firstName?: string;
    lastName?: string;
    email?:  string;
    phone?: string;
    blocked?: boolean;
    dateOfBirth?: Date;
    isPhoneVerified?: boolean;
    idVerificationStatus?: IdentityVerificationStatus;
    address?: string;
};
