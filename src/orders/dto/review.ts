import { OrderReview as PrismaOrderReview } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Review implements PrismaOrderReview {
    @Exclude() id: string;
    @Exclude() createdAt: Date;
    rating: number;
    review: string;
    revieweeId: string;
    reviewerId: string;
    reviewerAvatarUrl: string;
    orderId: string;

    constructor(partial: Partial<Review>) {
        Object.assign(this, partial);
    }
}