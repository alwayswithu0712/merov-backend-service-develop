import { Prisma, OrganizationVerificationStatus } from '@prisma/client';

export class UpdateOrganizationDto implements Prisma.OrganizationUpdateInput {
    name?: string
    taxId?: string
    address?: string
    website?: string
    organizationVerificationStatus?: OrganizationVerificationStatus
}

