import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Wallet } from '@prisma/client';
import { PrismaService } from '../shared/services/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletsService {
    constructor(private prisma: PrismaService) {}
    private readonly logger = new Logger(WalletsService.name);

    async findAll(params: { where?: Prisma.WalletWhereInput }): Promise<Wallet[]> {
        const wallets = await this.prisma.wallet.findMany({
            ...params,
        });
        return wallets;
    }

    async create(createWalletDto: CreateWalletDto, accountId: string): Promise<Wallet> {
        const wallet = await this.prisma.wallet.create({
            data: {
                ...createWalletDto,
                account: {
                    connect: {
                        id: accountId,
                    },
                },
            },
        });
        return wallet;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.wallet.delete({
            where: {
                id,
            },
        });
    }
}
