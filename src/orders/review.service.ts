import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { PrismaService } from "../shared/services/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { Review } from "./dto/review";
import { OrderService } from "./orders.service";
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class ReviewService {
    constructor(
        private accountsService: AccountsService,
        private prisma: PrismaService,
        private orderService: OrderService,
    ) {}

    public async create(review: CreateReviewDto, userId: string): Promise<Review> {
        const order = await this.orderService.getById(review.orderId);
    
        if (!order) {
            throw new NotFoundException(`Order with id ${review.orderId} not found`);
        }
    
        if (userId !== order.buyerId && userId !== order.sellerId) {
            throw new ForbiddenException(`You cannot review this order`);
        }
    
        if (order.status !== OrderStatus.Delivered && order.status !== OrderStatus.Refunded) {
            throw new ForbiddenException(`You cannot review this order`);
        }
    
        const reviewer = userId === order.buyer.id ? order.buyer : order.seller;
    
        const reviewee = userId === order.buyer.id ? order.seller : order.buyer;
    
        const newRating = (reviewee.rating * reviewee.reviewCount + review.rating) / (reviewee.reviewCount + 1);
    
        await this.accountsService.update(reviewee.id, {
            rating: newRating,
            reviewCount: reviewee.reviewCount + 1,
        });
    
        return this.prisma.orderReview.create({
            data: {
                rating: review.rating,
                review: review.review,
                reviewerAvatarUrl: reviewer.avatarUrl,
                order: {
                    connect: {
                        id: review.orderId,
                    },
                },
                reviewer: {
                    connect: {
                        id: userId,
                    },
                },
                reviewee: {
                    connect: {
                        id: reviewee.id,
                    },
                },
            },
        });
    }
}



