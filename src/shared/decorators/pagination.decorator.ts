import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Pagination } from '../typings/pagination';
import {RequestWithUser} from "../../auth/typings/requestWithUser";

export const paginationFunction = (data, ctx: ExecutionContext): Pagination => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();
    const isAdmin = req.user?.isAdmin;

    let paginationParams: Pagination = { };

    if (isAdmin) {
        if (req.query.pagination && typeof req.query.pagination === 'string') {
            paginationParams = JSON.parse(req.query.pagination);
        }
    }

    paginationParams.skip = req.query.skip ? parseInt(req.query.skip.toString()) : 0;

    if (req.query.take) {
        const parsed = parseInt(req.query.take.toString());
        if (parsed > 50) {
            paginationParams.take = 50;
        } else {
            paginationParams.take = parsed
        }
    } else {
        paginationParams.take = 10;
    }

    if (data) {
        paginationParams = {
            ...paginationParams,
            ...data,
        }
    }
        
    return paginationParams;
}


export const GetPagination = createParamDecorator(paginationFunction);
