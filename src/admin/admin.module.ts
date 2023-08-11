import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { CurrenciesService } from '../currencies/currencies.service';
import { ErbnService } from '../shared/services/erbn.service';
import { AdminController } from './admin.controller';
import { AnalyticsService } from './analytics.service';

@Module({
    imports: [AuthModule],
    controllers: [AdminController],
    providers: [CurrenciesService, ErbnService, AnalyticsService, PrismaService],
})
export class AdminModule {}
