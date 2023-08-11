import { Controller, UseGuards, Get } from '@nestjs/common';
import { ErbnService } from '../shared/services/erbn.service';
import RoleGuard from '../auth/role.guard';
import { Role } from '../auth/typings/role';
import { Vault } from '../shared/typings/vault';
import { AnalyticsService } from './analytics.service';


@Controller('admin')
@UseGuards(RoleGuard(Role.MerovAdmin))
export class AdminController {
    constructor(private readonly erbnService: ErbnService,
        private readonly analyticsService: AnalyticsService) {}

    @Get('/vaults')
    async vaults(): Promise<Vault> {
        return this.erbnService.getVaults();
    }

    @Get('/analytics')
    async analytics() {
        return this.analyticsService.get();
    }
}
