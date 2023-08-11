

import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginatedResponse, toPaginatedResponse } from "../shared/typings/paginatedResponse";
import { PrismaService } from "../shared/services/prisma.service";
import { Model } from "./dto/model";

@Injectable()
export class ModelsService {
    constructor( 
        private readonly prisma: PrismaService, 
    ) {}
    
    async create(data: Prisma.ModelCreateInput): Promise<Model>  {
        const model = await this.prisma.model.create({
            data,
        });

        return new Model(model);
    }

    async update(id: string, approved: boolean): Promise<Model>  {
        const model = await this.prisma.model.update({
            where: {
                id
            },
            data: {
                approved,
            },
        });

        return new Model(model);
    }

    async delete(id: string): Promise<Model>  {
        return this.prisma.model.delete({
            where: {
                id
            },
        });
    }

    async findAll(params: {
        where?: Prisma.ModelWhereInput;
        orderBy?: Prisma.ModelOrderByWithRelationAndSearchRelevanceInput;
        skip?: number;
        take?: number;
    }):Promise<PaginatedResponse<Model>> {

        const [count, models] = await Promise.all([
            this.prisma.model.count({
                where: params.where,
            }),
            this.prisma.model.findMany({ ...params  })
        ]);
        return toPaginatedResponse(
            models.map(model => new Model(model)),
            count,
            params.skip,
            params.take,
        );

    }
}