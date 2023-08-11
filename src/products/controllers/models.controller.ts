import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Pagination } from '../../shared/typings/pagination';
import { GetModelPagination } from '../decorators/model.pagination.decorator';
import { ModelsService } from '../models.service';

@Controller('models')
@ApiTags('Models')
export class ModelsController {
    private readonly logger = new Logger(ModelsController.name);

    constructor(private readonly modelsService: ModelsService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async get(@GetModelPagination() pagination: Pagination) {
        const params = {
            ...pagination,
            where: {
                ...pagination.where,
                approved: true,
            }
        }
        return this.modelsService.findAll(  params );
    }
}
