import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { SendBirdService } from '../shared/services/sendbird.service';
import { ConfigService } from '@nestjs/config';
import { AwsConfig } from '../config/config.interface';
import { Account } from './dto/account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { Prisma } from '@prisma/client';
import { PaginatedResponse, toPaginatedResponse } from 'src/shared/typings/paginatedResponse';

@Injectable()
export class AccountsService {
    constructor(
        private prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly sendbirdService: SendBirdService,
    ) {}
    private readonly logger = new Logger(AccountsService.name);

    async create(data: CreateAccountDto): Promise<Account> {
        data.avatarUrl = this.getAvatarUrl();

        const account = await this.prisma.account.create({
            data,
        });
        const sbUser = await this.sendbirdService.getOrCreateUser({
            nickname: data.name,
            user_id: account.id,
            profile_url: data.avatarUrl || '',
        });
        account.sendBirdAccessToken = sbUser.accessToken;

        const accountWithSb = await this.prisma.account.update({
            where: {
                id: account.id,
            },
            data: {
                sendBirdAccessToken: sbUser.accessToken,
            },
        });

        return new Account(accountWithSb);
    }

    async getById(id: string): Promise<Account> {
        const account = await this.prisma.account.findUnique({
            where: {
                id,
            },
            include: {
                products: true,
                organization: true,
            },
        });

        return new Account(account);
    }

    public async findAll(params: {
        where?: Prisma.AccountWhereInput;
        orderBy?: Prisma.AccountOrderByWithRelationAndSearchRelevanceInput;
        skip?: number;
        take?: number;
    }): Promise<PaginatedResponse<Account>> {
        const count = await this.prisma.account.count({
            where: params.where,
        });
        const accounts = await this.prisma.account.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                organization: true,
            },
            ...params,
        });

        return toPaginatedResponse(
            accounts.map((organization) => new Account(organization)),
            count,
            params.skip,
            params.take,
        );
    }

    async getByName(name: string): Promise<Account> {
        const account = await this.prisma.account.findUnique({
            where: {
                name,
            },
            include: {
                products: true,
            },
        });
        return new Account(account);
    }

    async update(id: string, data: UpdateAccountDto): Promise<Account> {
        const user = await this.prisma.account.update({
            where: {
                id,
            },
            data,
            include: {
                products: true,
            },
        });

        return new Account(user);
    }

    getAvatarUrl(): string {
        const awsConfig = this.configService.get<AwsConfig>('aws');
        const randomNumber = Math.floor(Math.random() * (20 - 1) + 1);
        return `${awsConfig.cloudfront.url}avatars/${randomNumber}.svg`;
    }
}
