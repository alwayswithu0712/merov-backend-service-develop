import { BadRequestException, createParamDecorator } from '@nestjs/common';
import { Pagination } from '../typings/pagination';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { searchProductsSchema } from '../../products/schema/search-product.schema';

export const GetProductSearchParams = createParamDecorator((data, ctx): Pagination => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();

    const { error } = searchProductsSchema.validate(req.query);

    if (error) {
        throw new BadRequestException(`Validation failed ${error}`);
    }
    const newQuery: Record<string, unknown> = {
        ...req.query,
    };
    if (!newQuery.size) {
        newQuery.size = 10;
    }
    return newQuery;
});
