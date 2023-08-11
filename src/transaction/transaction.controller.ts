import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import RoleGuard from '../auth/role.guard';
import { Role } from '../auth/typings/role';
import { Pagination } from '../shared/typings/pagination';
import { GetPagination } from '../shared/decorators/pagination.decorator';
import { ErbnService } from '../shared/services/erbn.service';
import { PaginatedResponse } from '../shared/typings/paginatedResponse';
import { Transaction } from '../shared/typings/transaction';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly erbnService: ErbnService) {}

    @Get()
    @UseGuards(RoleGuard(Role.MerovAdmin))
    async get(@GetPagination() pagination: Pagination): Promise<PaginatedResponse<Transaction>> {
        return this.erbnService.getTransactions(pagination);
    }
    @Get(':hash')
    @UseGuards(RoleGuard(Role.MerovAdmin))
    async getById(@Param('hash') hash: string): Promise<Transaction> {
        return this.erbnService.getTransaction(hash);
    }
}