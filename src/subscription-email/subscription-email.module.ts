import { Module } from '@nestjs/common';
import { SubscriptionEmailService } from './subscription-email.service';
import { SubscriptionEmailController } from './subscription-email.controller';
import { PrismaService } from '../shared/services/prisma.service';

@Module({
    imports: [],
    controllers: [SubscriptionEmailController],
    providers: [ SubscriptionEmailService, PrismaService],
    exports: [SubscriptionEmailService],
})
export class SubscriptionEmailModule {}