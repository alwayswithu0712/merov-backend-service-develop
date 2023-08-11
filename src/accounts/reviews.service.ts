import { Injectable, Logger } from '@nestjs/common';
import { OrderReview } from '@prisma/client';
import { PrismaService } from '../shared/services/prisma.service';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) {}
    private readonly logger = new Logger(ReviewsService.name);

    async getById(id: string): Promise<OrderReview[]> {
        const reviews = await this.prisma.orderReview.findMany({
            where: {
                revieweeId: id,
            },
            include: {
                reviewer: true,
            },
        });
        return reviews;
    }
}
