import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Pagination } from '../../shared/typings/pagination';
import { BrandsService } from '../brands.service';
import { GetBrandPagination } from '../decorators/brands.pagination.decorator';

@Controller('brands')
@ApiTags('Brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async get(@GetBrandPagination() pagination: Pagination) {
        const params = {
            ...pagination,
            where: {
                ...pagination.where,
                approved: true,
            }
        }
        return await this.brandsService.findAll( params);

    }
}
