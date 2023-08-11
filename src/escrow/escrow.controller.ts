import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import RoleGuard from '../auth/role.guard';
import { Role } from '../auth/typings/role';
import { Pagination } from '../shared/typings/pagination';
import { GetPagination } from '../shared/decorators/pagination.decorator';
import { ErbnService } from '../shared/services/erbn.service';

@Controller('escrows')
export class EscrowController {
    constructor(private readonly erbnService: ErbnService) {}

    @Get()
    @UseGuards(RoleGuard(Role.MerovAdmin))
    async get(@GetPagination() pagination: Pagination) {
        return this.erbnService.getEscrows(pagination);
    }
}
