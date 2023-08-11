import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Logger,
    NotFoundException,
    Param,
    Patch,
    Post,
    PreconditionFailedException,
    Req,
    UseGuards,
    UseInterceptors,
    UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Pagination } from '../../shared/typings/pagination';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { ProductsService } from '../products.service';
import { PaginatedResponse } from '../../shared/typings/paginatedResponse';
import { GetProductPagination } from '../decorators/products.pagination.decorator';
import { getProductsSchema } from '../schema/get-products.schema';
import { OptionalAuthGuard } from '../../shared/pipes/optional-auth.guard';
import { Product } from '../dto/product';
import { PriceValidationPipe } from '../../shared/pipes/price-validation.pipe';
import { CreateProductsDto } from '../dto/create-product.dto';
import { UpdateProductsDto } from '../dto/update-product.dto';
import { createProductSchema } from '../schema/create-product.schema';
import { updateProductSchema } from '../schema/update-product.schema';
import { GetProductSearchParams } from '../../shared/decorators/product.search-params.decorator';
import { SearchProductsDto } from '../dto/search-products.dto';
import { VerificationGuard } from '../../shared/pipes/verification.guard';
import PermissionGuard from '../../shared/pipes/permissions.guard';
import { Permission } from '../../shared/typings';

@Controller('products')
@ApiTags('Products')
@UseGuards(OptionalAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
    private readonly logger = new Logger(ProductsController.name);

    constructor(private readonly productService: ProductsService) {}

    @Post()
    @UsePipes(new JoiValidationPipe(createProductSchema), PriceValidationPipe)
    @UseGuards(PermissionGuard([Permission.Products]))
    @UseGuards(VerificationGuard)
    async create(@Req() req: RequestWithUser, @Body() createProduct: CreateProductsDto): Promise<Product> {
        return this.productService.create(createProduct, req.user.accountId);
    }

    @Patch(':id')
    @UseGuards(PermissionGuard([Permission.Products]))
    @UseGuards(VerificationGuard)
    async update(
        @Param('id') id: string,
        @Req() req: RequestWithUser,
        @Body(new JoiValidationPipe(updateProductSchema), PriceValidationPipe) updateProduct: UpdateProductsDto,
    ) {
        const currentProduct = await this.productService.getById(id);

        if (currentProduct.sellerId !== req.user.accountId) {
            throw new ForbiddenException(`Unauthorized`);
        }

        if (currentProduct.deleted) {
            throw new ForbiddenException(`Unauthorized`);
        }

        if (updateProduct.featured !== undefined) {
            throw new ForbiddenException(`Unauthorized`);
        }

        if (updateProduct.approved !== undefined) {
            throw new ForbiddenException(`Unauthorized`);
        }

        if (currentProduct.activeOrdersCount > 0) {
            throw new ForbiddenException(`Cannot update product with active orders `);
        }

        return this.productService.update(id, updateProduct);
    }

    @Delete(':id')
    @UseGuards(PermissionGuard([Permission.Products]))
    async delete(@Param('id') id: string, @Req() req: RequestWithUser): Promise<void> {
        const currentProduct = await this.productService.getById(id);

        if (currentProduct.sellerId !== req.user.accountId) {
            throw new ForbiddenException(`Unauthorized`);
        }

        if (currentProduct.activeOrdersCount > 0) {
            throw new PreconditionFailedException(`Can't delete a product with an existing order`);
        }

        return this.productService.delete(id);
    }

    @Get('featured')
    @UsePipes(new JoiValidationPipe(getProductsSchema))
    async getFeatured(): Promise<PaginatedResponse<Product>> {
        const params = {
            where: {
                featured: true,
                approved: true,
                published: true,
                stock: {
                    gt: 0,
                },
            },
        };

        return this.productService.findAll(params);
    }

    @Get('/search')
    async search(@GetProductSearchParams() params: SearchProductsDto): Promise<PaginatedResponse<Product>> {
        return this.productService.search(params);
    }

    @Get(':id')
    async getById(@Req() req: RequestWithUser, @Param('id') id: string): Promise<Product> {
        const accountId = req.user?.accountId;
        const product = await this.productService.getById(id);
        const isAdmin = req.user.isAdmin;

        const isNotSeller = !accountId || accountId !== product.sellerId;
        const isPrivate = !product.approved || !product.published;

        if (!isAdmin && isNotSeller && isPrivate) {
            throw new NotFoundException(`Product not found`);
        }

        return product;
    }

    @Get(':id/related')
    async getRelated(@Req() req: RequestWithUser, @Param('id') id: string): Promise<PaginatedResponse<Product>> {
        const product = await this.productService.getById(id);

        const params = {
            where: {
                categoryId: product.categoryId,
                approved: true,
                published: true,
                stock: {
                    gt: 0,
                },
            },
            take: 5,
        };

        return this.productService.findAll(params);
    }

    @Get()
    async get(@Req() req: RequestWithUser, @GetProductPagination() pagination: Pagination): Promise<PaginatedResponse<Product>> {
        const params = {
            ...pagination,
            where: {
                ...pagination.where,
                approved: true,
                published: true,
                stock: {
                    gt: 0,
                },
            },
        };

        return this.productService.findAll(params);
    }
}
