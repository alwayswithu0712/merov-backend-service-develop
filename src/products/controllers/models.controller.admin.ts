import { Body, Controller, Delete, Get, Param, Patch, Post, SerializeOptions, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ModelsService } from '../models.service';
import RoleGuard from '../../auth/role.guard';
import { Role } from '../../auth/typings/role';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { createModelSchema } from '../schema/create-model.schema';
import { CreateModelDto } from '../dto/create-model.dto';
import { updateModelSchema } from '../schema/update-model-schema';
import { MEROV_ADMIN } from '../../shared/typings/groups';
import { Pagination } from '../../shared/typings/pagination';
import { GetModelPagination } from '../decorators/model.pagination.decorator';

@Controller('admin/models')
@ApiTags('Models')
@UseGuards(AuthGuard('jwt'))
@UseGuards(RoleGuard(Role.MerovAdmin))
@SerializeOptions({ groups: [MEROV_ADMIN] })
export class AdminModelsController {

    constructor(private readonly modelsService: ModelsService) {}

    @Get()
    async get(@GetModelPagination() pagination: Pagination) {
        pagination = {...pagination, take:100000}
        return this.modelsService.findAll( pagination);
    }

    @Post()
    async create(@Body(new JoiValidationPipe(createModelSchema)) body: CreateModelDto) {
        return this.modelsService.create(body);
    }

    @Patch('/:id')
    async update(@Param('id') id: string, @Body(new JoiValidationPipe(updateModelSchema)) body: { approved: boolean }) {
        return this.modelsService.update(id, body.approved);
    }

    @Delete('/:id')
    async delete(@Param('id') id: string) {
        return this.modelsService.delete(id);
    }
}
