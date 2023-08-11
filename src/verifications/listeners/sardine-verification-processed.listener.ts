import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ConfigService } from "@nestjs/config";
import { SardineService } from "../../sardine/sardine.service";
import { SardineWebhookEvent } from "../../sardine/dto/webook-event";
import { ServerEventsService } from "../../server-events/server-events.service";
import { SardineRiskLevels } from "../../sardine/dto/risk-levels";
import { IdentityVerificationStatus } from "@prisma/client";
import { SardineFeedbackStatus } from "../../sardine/dto/feedback-status";
import { BackofficeConfig } from "../../config/config.interface";
import { PrismaService } from "../../shared/services/prisma.service";
import { SlackService } from "../../shared/services/slack.service";
import { IdentityVerificationsService } from "../identity-verifications.service";
import { SardineEvents } from "../events";

// This is set according to https://docs.sardine.ai/docs/integrate-risk/id-verification
const RiskLevelToIdVerificationStatusMap = {
    [SardineRiskLevels.Low]: IdentityVerificationStatus.Full,
    [SardineRiskLevels.Medium]: IdentityVerificationStatus.Full,
    [SardineRiskLevels.High]: IdentityVerificationStatus.Reviewing,
    [SardineRiskLevels.VeryHigh]: IdentityVerificationStatus.Blocked,
    [SardineRiskLevels.Unknown]: IdentityVerificationStatus.Reviewing,
};

@Injectable()
export class SardineVerificationProcessedListener {
    
    private readonly logger = new Logger(SardineVerificationProcessedListener.name);

    constructor(@Inject(ServerEventsService) private readonly eventsService: ServerEventsService,
                private readonly configService: ConfigService,
                private readonly sardineService: SardineService, 
                private readonly prismaService: PrismaService,
                private readonly identityService: IdentityVerificationsService,
                private readonly slackService: SlackService,) {}

    @OnEvent(SardineEvents.DocumentVerificationProcessed, { async: true })
    async handleDocumentVerificationProcessed(event: SardineWebhookEvent): Promise<void> {
        const {
            verification: { riskLevel },
            verificationId,
            status,
            documentData,
        } = event.documentVerificationResult;

        const { sessionKey } = event.data.case;

        const pendingVerification = await this.identityService.getById(verificationId);

        if (!pendingVerification) {
            this.logger.warn(`Sardine Verification ID ${verificationId} not found in database`);
            return;
        }

        if (pendingVerification.status !== 'pending') {
            this.logger.warn(`Sardine Verification ID ${verificationId} already processed`);
            return;
        }

        await this.identityService.update(verificationId, {
            status,
            address: documentData.address,
            dateOfBirth: new Date(documentData.dateOfBirth),
            firstName: documentData.firstName,
            lastName: documentData.lastName,
            response: JSON.stringify(event.documentVerificationResult),
        });

        if (RiskLevelToIdVerificationStatusMap[riskLevel] === IdentityVerificationStatus.Full) {
            await this.sardineService.feedbacks(sessionKey, pendingVerification.userId, SardineFeedbackStatus.Approved);
        }

        if (RiskLevelToIdVerificationStatusMap[riskLevel] === IdentityVerificationStatus.Reviewing) {
            const { url } = this.configService.get<BackofficeConfig>('backoffice');
            await this.slackService.sendMessage(
                'review-verifications',
                `Sardine Verification ID ${verificationId} queued for manual review riskLevel: ${riskLevel}.
                Please go to ${url}/kyc/${verificationId} to check the KYC`,
            );
        }

        if (RiskLevelToIdVerificationStatusMap[riskLevel] === IdentityVerificationStatus.Blocked) {
            await this.sardineService.feedbacks(sessionKey, pendingVerification.userId, SardineFeedbackStatus.Declined);
        }

        await this.prismaService.user.update({
            where: {
                id: pendingVerification.userId,
            },
            data: {
                idVerificationStatus: RiskLevelToIdVerificationStatusMap[riskLevel],
                firstName: documentData.firstName,
                lastName: documentData.lastName,
                dateOfBirth: new Date(documentData.dateOfBirth),
            },
        });

        await this.eventsService.add(event.data.case.customerID, {
            type: SardineEvents.DocumentVerificationProcessed
        });
    }
}