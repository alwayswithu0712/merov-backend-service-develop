import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import RoleGuard from '../../auth/role.guard';
import { Role } from '../../auth/typings/role';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { GetPagination } from '../../shared/decorators/pagination.decorator';
import { Pagination } from '../../shared/typings/pagination';
import { DisputesService } from '../disputes.service';
import { Dispute } from '../dto/dispute';

@Controller('admin/disputes')
@ApiTags('Disputes')
@UseGuards(RoleGuard(Role.MerovAdmin))
export class DisputesController {
    constructor(private readonly disputesService: DisputesService) {}

    @Get()
    async get(@GetPagination() pagination: Pagination): Promise<Dispute[]> {
        return this.disputesService.findAll(pagination);
    }

    @Get('/:id')
    async getById(@Req() req: RequestWithUser, @Param('id') id: string): Promise<any> {
        return this.disputesService.getById(id);
    }
}
