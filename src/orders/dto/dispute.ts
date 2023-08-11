import { Dispute as PrismaDispute, DisputeStatus, Order as PrismaOrder } from "@prisma/client";

interface FullPrismaDispute extends PrismaDispute {
    order: PrismaOrder;
}

export class Dispute implements PrismaDispute {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    orderId: string;
    reason: string;
    status: DisputeStatus;
    resolvedComment: string;
    resolvedAt: Date;
    resolvedBy: string;

    constructor(partial: Partial<FullPrismaDispute>) {
        Object.assign(this, partial);
    }
}
