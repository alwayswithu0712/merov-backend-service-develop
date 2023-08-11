import { Controller, Get, Param, Logger, UseGuards, SerializeOptions } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Account, Address } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { AddressesService } from '../addresses.service';
import RoleGuard from '../../auth/role.guard';
import { Role } from '../../auth/typings/role';
import { MEROV_ADMIN } from '../../shared/typings/groups';
import { GetPagination } from 'src/shared/decorators/pagination.decorator';
import { PaginatedResponse } from 'src/shared/typings/paginatedResponse';
import { Pagination } from 'src/shared/typings/pagination';
import { AccountsService } from '../accounts.service';

@Controller('admin/accounts')
@ApiTags('Accounts')
@UseGuards(AuthGuard('jwt'))
@UseGuards(RoleGuard(Role.MerovAdmin))
@SerializeOptions({ groups: [MEROV_ADMIN] })
export class AdminAccountsController {
    private readonly logger = new Logger(AdminAccountsController.name);

    constructor(private readonly accountsService: AccountsService,private readonly addressesService: AddressesService) {}

    @Get(':id')
    async getById(@Param('id') id: string): Promise<Account> {
        return this.accountsService.getById(id);
    }

    @Get()
    async get(@GetPagination() pagination: Pagination): Promise<PaginatedResponse<Account>> {
        return this.accountsService.findAll(pagination);
    }

    @Get('addresses')
    async getDeliveryAddress(@Param('addressId') addressId: string): Promise<Address> {
        return this.addressesService.getById(addressId);
    }

}
