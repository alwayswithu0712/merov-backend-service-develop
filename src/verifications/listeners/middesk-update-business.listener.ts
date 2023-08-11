import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from '@nestjs/event-emitter';
import { OrganizationVerificationStatus } from '@prisma/client';
import { MiddeskWebhookEvent } from "../../middesk/dto/webhook-event";
import { PrismaService } from "src/shared/services/prisma.service";
import { OrganizationsService } from "src/organizations/organizations.service";
import { MiddeskEvents } from "../events";

const MiddeskStatus = {
    Open: 'open',
    Pending: 'pending',
    InAudit: 'in_audit',
    InReview: 'in_review',
    Approved: 'approved',
    Rejected: 'rejected',
};

const MiddeskStatusToOrganizationVerificationStatusMap = {
    [MiddeskStatus.Open]: OrganizationVerificationStatus.Unverified,
    [MiddeskStatus.Pending]: OrganizationVerificationStatus.Pending,
    [MiddeskStatus.InAudit]: OrganizationVerificationStatus.Pending,
    [MiddeskStatus.InReview]: OrganizationVerificationStatus.Pending,
    [MiddeskStatus.Approved]: OrganizationVerificationStatus.Approved,
    [MiddeskStatus.Rejected]: OrganizationVerificationStatus.Rejected,
};

@Injectable()
export class MiddeskUpdateBusinessListener {
    
    private readonly logger = new Logger(MiddeskUpdateBusinessListener.name);

    constructor(private readonly prismaService: PrismaService,
                private readonly organizationsService: OrganizationsService) {}

    @OnEvent(MiddeskEvents.BusinessUpdated, { async: true })
    async handleUpdateBusiness(event: MiddeskWebhookEvent): Promise<void> {
        const { external_id: id, status } = event.data.object;

        const verification = await this.prismaService.organizationVerification.update({
            where: {
                id,
            },
            data: {
                status: MiddeskStatusToOrganizationVerificationStatusMap[status],
            },
        });
        
        await this.organizationsService.update(verification.organizationId, {
            organizationVerificationStatus: MiddeskStatusToOrganizationVerificationStatusMap[status] as OrganizationVerificationStatus,
        });
    }
}