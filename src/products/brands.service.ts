import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginatedResponse, toPaginatedResponse } from "../shared/typings/paginatedResponse";
import { PrismaService } from "../shared/services/prisma.service";
import { Brand } from "./dto/brand";

@Injectable()
export class BrandsService {
    constructor( 
        private readonly prisma: PrismaService, 
    ) {}
    
    async create (data: Prisma.BrandCreateInput) {
        const brand = await this.prisma.brand.create({
            data,
        });

        return new Brand(brand);
    }

    async update(id: string, approved: boolean) {
        const brand = await this.prisma.brand.update({
            where: {
                id
            },
            data: {
                approved,
            },
        });

        return new Brand(brand);
    }

    async delete(id: string): Promise<Brand>  {
        return this.prisma.brand.delete({
            where: {
                id
            },
        });
    }

    async findAll(params: {
        where?: Prisma.BrandWhereInput;
        orderBy?: Prisma.BrandOrderByWithRelationAndSearchRelevanceInput;
        skip?: number;
        take?: number;
    }):   Promise<PaginatedResponse<Brand>>  {

        const [count, brands] = await Promise.all([
            this.prisma.brand.count({
                where: params.where,
            }),
            this.prisma.brand.findMany({...params})
        ]);
        
        return toPaginatedResponse(
            brands.map(brand => new Brand(brand)),
            count,
            params.skip,
            params.take,
        );
    }
}