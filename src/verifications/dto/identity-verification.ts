import { IdentityVerification as PrismaIdentityVerification } from '@prisma/client';
import { Expose } from 'class-transformer';
import { MEROV_ADMIN } from '../../shared/typings/groups';

export class IdentityVerification implements PrismaIdentityVerification {
    @Expose({ groups: [MEROV_ADMIN] })
    id: string;
    @Expose({ groups: [MEROV_ADMIN] })
    createdAt: Date;
    @Expose({ groups: [MEROV_ADMIN] })
    userId: string;
    @Expose({ groups: [MEROV_ADMIN] })
    status: string;
    @Expose({ groups: [MEROV_ADMIN] })
    provider: string;
    @Expose({ groups: [MEROV_ADMIN] })
    response: string;
    @Expose({ groups: [MEROV_ADMIN] })
    firstName: string;
    @Expose({ groups: [MEROV_ADMIN] })
    lastName: string;
    @Expose({ groups: [MEROV_ADMIN] })
    dateOfBirth: Date;
    @Expose({ groups: [MEROV_ADMIN] })
    address: string;
    @Expose({ groups: [MEROV_ADMIN] })
    cipConfidence: string;

    constructor(partial: Partial<IdentityVerification>) {
        Object.assign(this, partial);
    }
    
}