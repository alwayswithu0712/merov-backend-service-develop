import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { SardineService } from '../sardine/sardine.service';
import { ApiClientService } from '../shared/services/api-client.service';

@Module({
    providers: [PrismaService, SardineService, ApiClientService],
    exports: [SardineService],
})
export class SardineModule {}
 