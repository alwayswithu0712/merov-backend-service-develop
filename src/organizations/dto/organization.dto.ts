import { Organization as PrismaOrganization } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { MEROV_ADMIN, ME } from '../../shared/typings/groups';

export class Organization implements PrismaOrganization {
    id: string;
    name: string;
    address: string;
    website: string;
    createdAt: Date;

    @Exclude()
    count: number;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    accountId: string;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    taxId: string;

    @Expose({ groups: [MEROV_ADMIN, ME] })
    organizationVerificationStatus;

    @Exclude()
    updatedAt: Date;

    constructor(partial: Partial<PrismaOrganization>) {
        Object.assign(this, partial);
    }
}
