import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { MiddeskService } from './middesk.service';
import { ApiClientService } from '../shared/services/api-client.service';

@Module({
    providers: [MiddeskService, ApiClientService, PrismaService],
    exports: [MiddeskService],
})
export class MiddeskModule {}
