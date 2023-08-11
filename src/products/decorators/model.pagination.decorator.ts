import {BadRequestException, createParamDecorator} from '@nestjs/common';
import {Pagination} from "../../shared/typings/pagination";
import {RequestWithUser} from "../../auth/typings/requestWithUser";
import { getModelSchema } from '../schema/get-model-schema';
import { paginationFunction } from '../../shared/decorators/pagination.decorator';

const orderBy = (sort?: string): { orderBy: { [field: string]: 'asc' | 'desc' } } => {
    switch (sort) {
        case 'name_desc':
            return {
                orderBy: {
                    name: 'desc',
                }
            }
        case 'name_asc':
            return {
                orderBy: {
                    name: 'asc',
                }
            }
        default:
            return {
                orderBy: {
                    name: 'asc',
                }
            }
    }
}

const getFilters = (req: RequestWithUser): Record<string, unknown> => {
    const { query } = req;

    const AND = [];

    if (query.categoryId) {
        AND.push({
            categoryId: query.categoryId
        })
    }

    if (query.subcategoryId) {
        AND.push({
            subcategoryId: query.subcategoryId 
        })
    }
    if (query.brand) {
        AND.push({
            brand: query.brand 
        })
    }

    if (query.approved) {
        AND.push({
            approved: query.approved === 'true',
            
        })
    }
    return {
        where: {
            AND,
        },
    }
}

export const GetModelPagination = createParamDecorator((data, ctx): Pagination => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();

    const { error } = getModelSchema.validate(req.query);

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