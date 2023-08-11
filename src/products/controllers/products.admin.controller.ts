import { Body, Controller, Delete, Get, Logger, Param, Patch, SerializeOptions, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Pagination } from '../../shared/typings/pagination';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { UpdateProductsDto } from '../dto/update-product.dto';
import { ProductsService } from '../products.service';
import { updateProductSchema } from '../schema/update-product.schema';
import { PaginatedResponse } from '../../shared/typings/paginatedResponse';
import {GetProductPagination} from "../decorators/products.pagination.decorator";
import RoleGuard from "../../auth/role.guard";
import {Role} from "../../auth/typings/role";
import {Product} from "../dto/product";
import { MEROV_ADMIN } from '../../shared/typings/groups';

@Controller('admin/products')
@ApiTags('Products')
@UseGuards(AuthGuard('jwt'))
@UseGuards(RoleGuard(Role.MerovAdmin))
@SerializeOptions({ groups: [MEROV_ADMIN] })
export class AdminProductsController {
    private readonly logger = new Logger(AdminProductsController.name);

    constructor(
        private readonly productService: ProductsService, 
    ) {}

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body(new JoiValidationPipe(updateProductSchema)) updateProduct: UpdateProductsDto,
    ) {
        return this.productService.update(id, updateProduct);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        return this.productService.delete(id);
    }

    @Get('/:id')
    async getById(@Param('id') id: string): Promise<Product> {
       return this.productService.getById(id);
    }

    @Get()
    async get(@GetProductPagination() pagination: Pagination): Promise<PaginatedResponse<Product>> {
        return this.productService.findAll(pagination);
    }
}
