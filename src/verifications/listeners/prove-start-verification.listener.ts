import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from '@nestjs/event-emitter';
import { IdentityVerificationStatus } from '@prisma/client';
import { ProveVerificationStartDto } from "src/prove/dto/prove.dto";
import { ProveService } from "src/prove/prove.service";
import { UserService } from "src/user/user.service";
import { ProveEvents } from "../events";
import { IdentityVerificationsService } from "../identity-verifications.service";


@Injectable()
export class ProveStartVerificationListener {
    
    private readonly logger = new Logger(ProveStartVerificationListener.name);

    constructor(private readonly userService: UserService,
                private readonly proveService: ProveService, 
                private readonly identityService: IdentityVerificationsService) {}

    @OnEvent(ProveEvents.StartVerification, { async: true })
    async handleStartVerification(dto: ProveVerificationStartDto): Promise<void> {
        const user = await this.userService.getById(dto.userId);

        const isPhoneReputationOk = await this.proveService.checkPhoneReputation({ phone: user.phone });

        if (!isPhoneReputationOk) {
            this.logger.warn(`[${user.id}] Prove identity verification aborted, reason isPhoneReputationOk: ${isPhoneReputationOk}`);
            return;
        }

        const identityResponse = await this.proveService.identity({ phone: user.phone, dateOfBirth: user.dateOfBirth });

        if (identityResponse.status !== 0) {
            this.logger.warn(
                `[${user.id}] Prove identity verification aborted, reason identityResponse.status: ${identityResponse.status}`,
            );
            return;
        }

        const { individual } = identityResponse.response;

        const verifyDto = {
            phone: user.phone,
            firstName: individual.firstName,
            lastName: individual.lastName,
            ssn: individual.ssn,
            dateOfBirth: user.dateOfBirth,
            ...individual.addresses[0],
        };

        const verifyResponse = await this.proveService.verify(verifyDto);

        if (verifyResponse.status !== 0) return;

        await this.identityService.create(
            {
                id: verifyResponse.response.transactionId,
                status: verifyResponse.response.verified ? 'verified' : 'unverified',
                provider: 'prove',
                response: JSON.stringify(verifyResponse.response),
                cipConfidence: verifyResponse.response.cipConfidence,
                firstName: individual.firstName,
                lastName: individual.lastName,
                dateOfBirth: user.dateOfBirth,
                address:
                    individual.addresses.length > 0
                        ? `${individual.addresses[0].address}, ${individual.addresses[0].extendedAddress}, ${individual.addresses[0].city}, ${individual.addresses[0].region}, ${individual.addresses[0].postalCode}`
                        : '',
            },
            user.id,
        );

        if (verifyResponse.response.verified) {
            await this.userService.update(user.id, {
                idVerificationStatus: IdentityVerificationStatus.Lite,
            });
        }
    }
}