import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { AdminVerificationsController } from './controllers/verifications.controller.admin';
import { UsersModule } from '../user/user.module';
import { VerificationsController } from './controllers/verifications.controller';
import { SmsService } from '../shared/services/sms.service';
import { PhoneOtpService } from './otp.service';
import { SlackService } from '../shared/services/slack.service';
import { IdentityVerificationsService } from './identity-verifications.service';
import { SardineVerificationProcessedListener } from './listeners/sardine-verification-processed.listener';
import { ServerEventsModule } from '../server-events/server-events.module';
import { ProveStartVerificationListener } from './listeners/prove-start-verification.listener';
import { ProveModule } from '../prove/prove.module';
import { SardineModule } from '../sardine/sardine.module';
import { MiddeskUpdateBusinessListener } from './listeners/middesk-update-business.listener';
import { OrganizationsModule } from '../organizations/organizations.module';
import { OrganizationCreatedListener } from './listeners/organization-created.listener';
import { MiddeskService } from '../middesk/middesk.service';
import { ApiClientService } from '../shared/services/api-client.service';

@Module({
    imports: [AuthModule, UsersModule, OrganizationsModule, ServerEventsModule, ProveModule, SardineModule],
    controllers: [AdminVerificationsController, VerificationsController],
    providers: [
        PrismaService,
        MiddeskService,
        ApiClientService,
        SmsService,
        IdentityVerificationsService,
        PhoneOtpService,
        SlackService,
        ProveStartVerificationListener,
        SardineVerificationProcessedListener,
        MiddeskUpdateBusinessListener,
        OrganizationCreatedListener,
    ],
})
export class VerificationsModule {}
