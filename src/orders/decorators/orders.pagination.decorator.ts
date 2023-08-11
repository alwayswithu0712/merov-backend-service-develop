import {BadRequestException, createParamDecorator} from '@nestjs/common';
import {paginationFunction} from "../../shared/decorators/pagination.decorator";
import {Pagination} from "../../shared/typings/pagination";
import {RequestWithUser} from "../../auth/typings/requestWithUser";
import { getOrdersSchema } from '../schema/get-orders.schema';

const orderBy = (sort?: string): { orderBy: { [field: string]: 'asc' | 'desc' } } => {
    switch (sort) {
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


export const GetOrderPagination = createParamDecorator((data, ctx): Pagination => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();

    const { error } = getOrdersSchema.validate(req.query);

    if (error) {
        throw new BadRequestException(`Validation failed ${error}`);
    }

    const paginationResult = paginationFunction(data, ctx);
    const sort: string = typeof req.query.sort === 'string' ? req.query.sort : undefined;
  
    return {
        ...orderBy(sort),
        ...paginationResult,
    };
})
