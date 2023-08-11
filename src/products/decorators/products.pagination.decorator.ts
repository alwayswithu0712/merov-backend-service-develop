import {BadRequestException, createParamDecorator} from '@nestjs/common';
import {paginationFunction} from "../../shared/decorators/pagination.decorator";
import {Pagination} from "../../shared/typings/pagination";
import {RequestWithUser} from "../../auth/typings/requestWithUser";
import { getProductsSchema } from '../schema/get-products.schema';

const orderBy = (sort?: string): { orderBy: { [field: string]: 'asc' | 'desc' } } => {
    switch (sort) {
        case 'price_desc':
            return {
                orderBy: {
                    priceInUsd: 'desc',
                }
            }
        case 'price_asc':
            return {
                orderBy: {
                    priceInUsd: 'asc',
                }
            }
        case 'created_desc':
            return {
                orderBy: {
                    createdAt: 'desc',
                }
            }
        case 'created_asc':
            return {
                orderBy: {
                    createdAt: 'asc',
                }
            }
        case 'name_desc':
            return {
                orderBy: {
                    title: 'desc',
                }
            }
        case 'name_asc':
            return {
                orderBy: {
                    title: 'asc',
                }
            }
        default:
            return {
                orderBy: {
                    createdAt: 'desc',
                }
            }
    }
}

const getFilters = (req: RequestWithUser): Record<string, unknown> => {
    const { query } = req;

    const AND = [];

    if (query.featured) {
        AND.push({
            featured: true
        })
    }

    if (query.published) {
        AND.push({
            published: query.published === 'true'
        })
    }

    if (query.hasStock) {
        AND.push({
            stock: {
                gte: 0,
            }
        })
    }

    if (query.minPrice) {
        AND.push({
            priceInUsd: {
                gte: query.minPrice,
            }
        })
    }

    if (query.maxPrice) {
        AND.push({
            priceInUsd: {
                lte: query.maxPrice,
            }
        })
    }

    if (query.categoryIds && typeof query.categoryIds === 'string') {
        AND.push({
            categoryId: {
                in: query.categoryIds.split(',')
            },
        })
    }

    if (query.subcategoryIds && typeof query.subcategoryIds === 'string') {
        AND.push({
            subcategoryId: {
                in: query.subcategoryIds.split(',')
            },
        })
    }

    if (query.brands && typeof query.brands === 'string') {
        AND.push({
            brand: {
                in: query.brands.split(','),
            }
        })
    }

    if (query.models && typeof query.models === 'string') {
        AND.push({
            model: {
                in: query.models.split(','),
            }
        })
    }

    if (query.conditions && typeof query.conditions === 'string') {
        AND.push({
            condition: {
                in: query.conditions.split(','),
            }
        })
    }

    if (query.currencies && typeof query.currencies === 'string') {
        AND.push({
            currency: {
                in:  query.currencies.split(','),
            }
        })
    }

    if (query.sellerId && typeof query.sellerId === 'string') {
        AND.push({
            sellerId: query.sellerId,
        })
    }

    return {
        where: {
            AND,
        },
    }
}

export const GetProductPagination = createParamDecorator((data, ctx): Pagination => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();

    const { error } = getProductsSchema.validate(req.query);

    if (error) {
        throw new BadRequestException(`Validation failed ${error}`);
    }

    const paginationResult = paginationFunction(data, ctx);
    const sort: string = typeof req.query.sort === 'string' ? req.query.sort : undefined;

    return {
        ...orderBy(sort),
        ...getFilters(req),
        ...paginationResult,
    };
})
