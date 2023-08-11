import { Prisma, OrganizationVerificationStatus } from '@prisma/client';


export class CreateOrganizationDto {
    id?: string
    count?: number
    organizationVerificationStatus?: OrganizationVerificationStatus
    name: string
    taxId: string
    address: string
    website: string
}

export class CreateOrganizationWithAccountDto extends CreateOrganizationDto implements Prisma.OrganizationCreateInput {
    account: Prisma.AccountCreateNestedOneWithoutOrganizationInput
}
