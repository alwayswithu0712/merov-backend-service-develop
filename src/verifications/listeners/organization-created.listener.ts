import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Organization, OrganizationVerificationStatus } from '@prisma/client';
import { PrismaService } from '../../shared/services/prisma.service';
import { MiddeskService } from '../../middesk/middesk.service';
import { Address } from '../../shared/typings/address';
import { MiddeskBusinessAddress } from '../../middesk/dto/create-business';
import { getStateAbbreviation } from '../helpers/getStateAbbreviation';

@Injectable()
export class OrganizationCreatedListener {
    constructor(private readonly prismaService: PrismaService, private readonly middeskService: MiddeskService) {}

    @OnEvent('organization.created', { async: true })
    async handleOrganizationCreatedEvent(event: { organization: Organization }) {
        const { organization } = event;
        const address = JSON.parse(organization.address) as Address;

        if (!getStateAbbreviation(address.state)) return;
        const business = await this.middeskService.createBusiness(
            {
                name: organization.name,
                website: { url: organization.website },
                addresses: [toMiddeskAddress(organization.address)],
                tin: {
                    tin: organization.taxId,
                },
            },
            organization.id,
        );

        const verification = await this.prismaService.organizationVerification.create({
            data: {
                id: organization.id,
                status: OrganizationVerificationStatus.Pending,
                provider: 'middesk',
                response: JSON.stringify(business),
                organization: {
                    connect: {
                        id: organization.id,
                    },
                },
            },
        });
        return verification;
    }
}

const toMiddeskAddress = (addressString: string): MiddeskBusinessAddress => {
    const address = JSON.parse(addressString) as Address;

    return {
        address_line1: address.street,
        city: address.city,
        state: getStateAbbreviation(address.state),
        postal_code: address.postcode,
    };
};
