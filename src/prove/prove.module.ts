import { Module } from '@nestjs/common';
import { SmsService } from '../shared/services/sms.service';
import { ApiClientService } from '../shared/services/api-client.service';
import { ProveService } from './prove.service';
import { PrismaService } from '../shared/services/prisma.service';

@Module({
    providers: [PrismaService, ProveService, ApiClientService, SmsService],
    exports: [ProveService],
})
export class ProveModule {}
