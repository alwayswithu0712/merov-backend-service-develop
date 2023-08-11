import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../shared/services/prisma.service';
import { PaginatedResponse, toPaginatedResponse } from '../shared/typings/paginatedResponse';
import { Organization } from './dto/organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateOrganizationDto, CreateOrganizationWithAccountDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
    constructor(private prisma: PrismaService) {}
    private readonly logger = new Logger(OrganizationsService.name);

    async getById(id: string): Promise<Organization> {
        const organization = await this.prisma.organization.findUnique({
            where: {
                id,
            },
        });

        return new Organization(organization);
    }

    public async findAll(params: {
        where?: Prisma.OrganizationWhereInput;
        orderBy?: Prisma.OrganizationOrderByWithRelationAndSearchRelevanceInput;
        skip?: number;
        take?: number;
    }): Promise<PaginatedResponse<Organization>> {
        const count = await this.prisma.organization.count({
            where: params.where,
        });
        const organizations = await this.prisma.organization.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            ...params,
        });

        return toPaginatedResponse(
            organizations.map((organization) => new Organization(organization)),
            count,
            params.skip,
            params.take,
        );
    }

    public async findOne(params: { where?: Prisma.OrganizationWhereInput }): Promise<Organization> {
        const organization = await this.prisma.organization.findFirst({
            ...params,
        });
        return new Organization(organization);
    }

    async update(id: string, data: UpdateOrganizationDto): Promise<Organization> {
        const address = await this.prisma.organization.update({
            where: {
                id,
            },
            data,
        });

        return address;
    }

    async create(data: CreateOrganizationWithAccountDto): Promise<Organization> {
        const organization = await this.prisma.organization.create({
            data,
        });

        return new Organization(organization);
    }
}
