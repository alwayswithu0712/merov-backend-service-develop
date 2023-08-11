import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaPromise, Product as PrismaProduct } from '@prisma/client';
import { PaginatedResponse, toPaginatedResponse } from '../shared/typings/paginatedResponse';
import { generateId } from '../shared/helpers/id';
import { PrismaService } from '../shared/services/prisma.service';
import { CreateProductsDto } from './dto/create-product.dto';
import { Product } from './dto/product';
import { UpdateProductsDto } from './dto/update-product.dto';
import { ConfigService } from '@nestjs/config';
import { MerovConfig } from '../config/config.interface';
import { CurrenciesService } from '../currencies/currencies.service';
import { OpensearchService } from '../shared/services/opensearch.service';
import { SearchProductsDto } from './dto/search-products.dto';

const include = { category: true, subcategory: true, orders: true, seller: true, offers: true };
@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly currenciesService: CurrenciesService,
        private readonly configService: ConfigService,
        private readonly opensearchService: OpensearchService,
    ) {}

    async create(createProductDto: CreateProductsDto, sellerId: string): Promise<Product> {
        const merovConfig = this.configService.get<MerovConfig>('merov');

        const exchangeRate = await this.currenciesService.getPrice(createProductDto.currency);

        const prismaProduct = await this.prisma.product.create({
            data: {
                id: generateId(),
                title: createProductDto.title,
                description: createProductDto.description,
                brand: createProductDto.brand,
                stock: createProductDto.stock,
                condition: createProductDto.condition,
                sellerAddress: createProductDto.sellerAddress,
                model: createProductDto.model,
                currency: createProductDto.currency,
                chain: createProductDto.chain,
                price: createProductDto.price,
                priceInUsd: createProductDto.price * exchangeRate,
                images: createProductDto.images,
                minTestingTime: createProductDto.minTestingTime || merovConfig.defaultMinTestingTime,
                maxTestingTime: createProductDto.maxTestingTime || merovConfig.defaultMaxTestingTime,
                published: createProductDto.published,
                weight: createProductDto.weight,
                length: createProductDto.length,
                width: createProductDto.width,
                height: createProductDto.height,
                weightUnit: createProductDto.weightUnit,
                dimensionsUnit: createProductDto.dimensionsUnit,
                approved: true,
                seller: {
                    connect: {
                        id: sellerId,
                    },
                },
                category: {
                    connect: {
                        id: createProductDto.categoryId,
                    },
                },
                subcategory: {
                    connect: {
                        id: createProductDto.subcategoryId,
                    },
                },
                deliveryAddress: {
                    connect: {
                        id: createProductDto.deliveryAddressId,
                    },
                },
            },
            include,
        });

        const product = new Product(prismaProduct);

        await this.opensearchService.addProduct(product);

        return product;
    }

    getUpdatePromise(id: string, data: UpdateProductsDto): PrismaPromise<PrismaProduct> {
        return this.prisma.product.update({
            where: {
                id,
            },
            data,
            include,
        });
    }

    async update(id: string, data: UpdateProductsDto): Promise<Product> {
        const prismaProduct = await this.getUpdatePromise(id, data);

        const product = new Product(prismaProduct);

        if (product.approved && product.published && !product.deleted) {
            await this.opensearchService.addProduct(product);
        } else {
            await this.opensearchService.deleteProduct(product.id);
        }

        return product;
    }

    async delete(id: string): Promise<void> {
        const prismaProduct = await this.prisma.product.update({
            where: {
                id,
            },
            data: {
                deleted: true,
                offers: {
                    updateMany: {
                        where: {
                            productId: id,
                        },
                        data: { status: 'Closed' },
                    },
                },
            },
        });

        const product = new Product(prismaProduct);
        await this.opensearchService.deleteProduct(product.id);
    }

    async getById(id: string): Promise<Product> {
        const product = await this.prisma.product.findFirst({
            where: {
                id,
                deleted: false,
            },
            include,
        });

        if (!product) {
            throw new NotFoundException(`Product not found`);
        }

        return new Product(product);
    }

    async search(params: SearchProductsDto): Promise<PaginatedResponse<Product>> {
        const res = await this.opensearchService.searchProducts(params);
        return {
            ...res,
            response: res.response,
        };
    }

    async findAll(params: {
        where?: Prisma.ProductWhereInput;
        orderBy?: Prisma.ProductOrderByWithRelationAndSearchRelevanceInput;
        skip?: number;
        take?: number;
    }): Promise<PaginatedResponse<Product>> {
        const [count, products] = await Promise.all([
            this.prisma.product.count({
                where: {
                    ...params.where,
                    deleted: false,
                },
            }),
            this.prisma.product.findMany({
                ...params,
                where: {
                    ...params.where,
                    deleted: false,
                },
                include,
            }),
        ]);
        return toPaginatedResponse(
            products.map((p) => new Product(p)),
            count,
            params.skip,
            params.take,
        );
    }

    async getTotalValue(sellerId: string): Promise<number> {
        const products = await this.prisma.product.findMany({
            where: {
                sellerId,
            },
        });

        return products.reduce((acc, product) => acc + product.priceInUsd, 0);
    }
}
