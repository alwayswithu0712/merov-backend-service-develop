import { Body, Controller, Delete, Get, Param, Patch, Post, SerializeOptions, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { BrandsService } from '../brands.service';
import RoleGuard from '../../auth/role.guard';
import { Role } from '../../auth/typings/role';
import { updateBrandSchema } from '../schema/update-brand-schema';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { createBrandSchema } from '../schema/create-brand.schema';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { MEROV_ADMIN } from '../../shared/typings/groups';
import { GetBrandPagination } from '../decorators/brands.pagination.decorator';
import { Pagination } from '../../shared/typings/pagination';

@Controller('admin/brands')
@ApiTags('Brands')
@UseGuards(AuthGuard('jwt'))
@UseGuards(RoleGuard(Role.MerovAdmin))
@SerializeOptions({ groups: [MEROV_ADMIN] })
export class AdminBrandsController {
    constructor(private readonly brandsService: BrandsService) {}

    @Get()
    async get(@GetBrandPagination() pagination: Pagination) {
        pagination = {...pagination, take:10000}
        return this.brandsService.findAll(pagination);
    }

    @Post()
    async create(@Body(new JoiValidationPipe(createBrandSchema)) body: CreateBrandDto) {
        return this.brandsService.create(body);
    }

    @Patch('/:id')
    async update(@Param('id') id: string, @Body(new JoiValidationPipe(updateBrandSchema)) body: { approved: boolean }) {
        return this.brandsService.update(id, body.approved);
    }

    @Delete('/:id')
    async delete(@Param('id') id: string) {
        return this.brandsService.delete(id);
    }
}
