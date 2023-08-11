import { Controller, Get, Param, Logger, UseGuards, SerializeOptions } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Organization } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from '../organizations.service';
import RoleGuard from '../../auth/role.guard';
import { Role } from '../../auth/typings/role';
import { MEROV_ADMIN } from '../../shared/typings/groups';
import { GetPagination } from '../../shared/decorators/pagination.decorator';
import { Pagination } from '../../shared/typings/pagination';
import { PaginatedResponse } from '../../shared/typings/paginatedResponse';
import { User } from '../../user/dto/user.dto';
import { MembersService } from '../members.service';

@Controller('admin/organizations')
@ApiTags('Organizations')
@SerializeOptions({ groups: [MEROV_ADMIN] })
@UseGuards(AuthGuard('jwt'))
@UseGuards(RoleGuard(Role.MerovAdmin))

export class AdminOrganizationsController {
    private readonly logger = new Logger(AdminOrganizationsController.name);

    constructor(private readonly organizationsService: OrganizationsService, private readonly membersService: MembersService) {}

    @Get(':id')
    async getById(@Param('id') id: string): Promise<Organization> {
        return this.organizationsService.getById(id);
    }

    @Get()
    async get(@GetPagination() pagination: Pagination): Promise<PaginatedResponse<Organization>> {
        return this.organizationsService.findAll(pagination);
    }

    @Get(':id/members')
    async getMembers(@Param('id') organizationId: string): Promise<User[]> {
        const organization = await this.organizationsService.getById(organizationId);
        return this.membersService.getByAccountId(organization.accountId);
    }

    @Get(':id/members/:memberId')
    async getMember(@Param('id') organizationId: string, @Param('memberId') memberId: string): Promise<User> {
        const organization = await this.organizationsService.getById(organizationId);
        return this.membersService.getByAccountIdMemberId(organization.accountId, memberId);
    }
}
