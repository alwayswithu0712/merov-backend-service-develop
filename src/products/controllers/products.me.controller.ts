import {
    Controller,
    Get,
    Logger,
    NotFoundException,
    Param,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Pagination } from '../../shared/typings/pagination';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { ProductsService } from '../products.service';
import { PaginatedResponse } from '../../shared/typings/paginatedResponse';
import { GetProductPagination } from '../decorators/products.pagination.decorator';
import { Product } from '../dto/product';
import { PermissionsSerializerInterceptor } from 'src/shared/interceptors/class-serializer.interceptors';

@Controller('accounts/me/products')
@ApiTags('Products')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(PermissionsSerializerInterceptor)
export class MyProductsController {
    private readonly logger = new Logger(MyProductsController.name);

    constructor(private readonly productService: ProductsService) {}

    @Get()
    async get(@Req() req: RequestWithUser, @GetProductPagination() pagination: Pagination): Promise<PaginatedResponse<Product>> {
        const params = {
            ...pagination,
            where: {
                sellerId: req.user.accountId,
            },
        };

        return this.productService.findAll(params);
    }

    @Get('/total-value')
    async getTotalValueTransactedThisMonth(@Req() req: RequestWithUser): Promise<number> {
        return this.productService.getTotalValue(req.user.accountId);
    }

    @Get(':id')
    async getById(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Product> {
        const accountId = req.user.accountId;
        const product = await this.productService.getById(id);

        const isNotSeller = accountId !== product.sellerId;

        if (isNotSeller) {
            throw new NotFoundException(`Product not found`);
        }

        return product;
    }
}
