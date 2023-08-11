import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../shared/services/prisma.service';
import { Dispute } from './dto/dispute';

@Injectable()
export class DisputesService {
    constructor(private prisma: PrismaService) {}

    public async getById(id: string): Promise<Dispute> {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id },
            include: {
                order: true,
            },
        });

        return new Dispute(dispute);
    }

    public async getByOrderId(orderId: string): Promise<Dispute> {
        const dispute = await this.prisma.dispute.findUnique({
            where: { orderId },
            include: {
                order: true,
            },
        });
        return new Dispute(dispute);
    }

    public async findAll(params: {
        where?: Prisma.DisputeWhereInput;
        orderBy?: Prisma.DisputeOrderByWithRelationAndSearchRelevanceInput;
        skip?: number;
        take?: number;
    }): Promise<Dispute[]> {
        const disputes = await this.prisma.dispute.findMany({
            ...params,
            include: {
                order: true,
            },
        });

        return disputes.map(dispute => new Dispute(dispute));
    }
}
