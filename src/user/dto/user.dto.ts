import { IdentityVerificationStatus, Account as PrismaAccount, User as PrismaUser } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { Account } from '../../accounts/dto/account.dto';
import { Permission } from "../../shared/typings/permissions";
import { MEROV_ADMIN, ME } from '../../shared/typings/groups';

export interface FullPrismaUser extends PrismaUser {
    account: PrismaAccount;
}

export class User implements PrismaUser {
    id: string;
    authId: string;
    accountId: string;
    createdAt: Date;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    address: string;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    dateOfBirth: Date;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    firstName: string;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    lastName: string;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    email: string;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    phone: string;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    isPhoneVerified: boolean;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    idVerificationStatus: IdentityVerificationStatus;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    @Type(() => Account)
    account: Account;

    @Expose({ groups: [MEROV_ADMIN, ME, Permission.Owner, Permission.Admin] })
    permissions: Permission[];

    @Expose({ groups: [MEROV_ADMIN] })
    blocked: boolean;

    @Expose({ groups: [MEROV_ADMIN] })
    count: number;

    @Expose({ groups: [MEROV_ADMIN] })
    updatedAt: Date;

    constructor(partial: Partial<FullPrismaUser>) {
        Object.assign(this, partial);
    }
}
