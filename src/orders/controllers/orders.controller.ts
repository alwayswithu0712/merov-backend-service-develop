import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Patch,
    Req,
    UsePipes,
    UnauthorizedException,
    ClassSerializerInterceptor,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderService } from '../orders.service';
import { createOrderSchema } from '../schema/create-order.schema';
import { createReviewSchema } from '../schema/create-review.schema';
import { updateOrderSchema } from '../schema/update-review.schema';
import { Pagination } from '../../shared/typings/pagination';
import { GetOrderPagination } from '../decorators/orders.pagination.decorator';
import { PaginatedResponse } from '../../shared/typings/paginatedResponse';
import { Order } from '../dto/order';
import { Review } from '../dto/review';
import { ReviewService } from '../review.service';
import { CreateOrderAuthorizationGuard } from '../decorators/create-order.guard';
import { UpdateOrderAuthorizationGuard } from '../decorators/update-order.guard';
import PermissionGuard from '../../shared/pipes/permissions.guard';
import { Permission } from '../../shared/typings';

@Controller('orders')
@ApiTags('Orders')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
export class OrderController {
    constructor(private readonly orderService: OrderService, private readonly reviewService: ReviewService) {}

    @Post()
    @UsePipes(new JoiValidationPipe(createOrderSchema))
    @UseGuards(PermissionGuard([Permission.Orders]))
    @UseGuards(CreateOrderAuthorizationGuard)
    async create(@Req() req: RequestWithUser, @Body() createOrderDto: CreateOrderDto): Promise<Order> {
        const accountId = req.user.accountId;

        if (createOrderDto.offerId) {
            return this.orderService.createFromOffer(createOrderDto, accountId);
        }

        return this.orderService.createFromProduct(createOrderDto, accountId);
    }

    @Get('/completed')
    @UseGuards(PermissionGuard([Permission.Orders]))
    async getCompeleted(@Req() req: RequestWithUser, @GetOrderPagination() pagination: Pagination) {
        const accountId = req.user.accountId;
        const params = {
            where: {
                AND: [OrderService.filters.byCompleted(), req.query.condition === 'seller' ? { sellerId: accountId } : { buyerId: accountId }],
            },
            ...pagination,
        };
        return this.orderService.findAll(params);
    }

    @Get('/active')
    @UseGuards(PermissionGuard([Permission.Orders]))
    async getActive(@Req() req: RequestWithUser, @GetOrderPagination() pagination: Pagination) {
        const accountId = req.user.accountId;
        const params = {
            where: {
                AND: [OrderService.filters.byActive(), req.query.condition === 'seller' ? { sellerId: accountId } : { buyerId: accountId }],
            },
            ...pagination,
        };
        return this.orderService.findAll(params);
    }

    @Patch('/:id')
    @UseGuards(PermissionGuard([Permission.Orders]))
    @UseGuards(UpdateOrderAuthorizationGuard)
    async update(@Param('id') id: string, @Body(new JoiValidationPipe(updateOrderSchema)) updateOrderDto: UpdateOrderDto): Promise<Order> {
        return this.orderService.update(id, updateOrderDto);
    }

    @Get()
    @UseGuards(PermissionGuard([Permission.Orders]))
    async get(@Req() req: RequestWithUser, @GetOrderPagination() pagination: Pagination): Promise<PaginatedResponse<Order>> {
        const accountId = req.user.accountId;
        const params = {
            where: {
                AND: [req.query.condition === 'seller' ? { sellerId: accountId } : { buyerId: accountId }],
            },
            ...pagination,
        };

        return this.orderService.findAll(params);
    }

    @Get('/total-value-transacted-this-month')
    @UseGuards(PermissionGuard([Permission.Orders]))
    async getTotalValueTransactedThisMonth(@Req() req: RequestWithUser): Promise<number> {
        return this.orderService.getTotalValueTransactedThisMonth(req.user.accountId);
    }

    @Post('/:orderId/reviews')
    async createReview(
        @Req() req: RequestWithUser,
        @Param('orderId') orderId: string,
        @Body(new JoiValidationPipe(createReviewSchema)) review: CreateReviewDto,
    ): Promise<Review> {
        return this.reviewService.create({ orderId, ...review }, req.user.accountId);
    }

    @Get('/:id')
    @UseGuards(PermissionGuard([Permission.Orders]))
    async getById(@Req() req: RequestWithUser, @Param('id') id: string): Promise<Order> {
        const accountId = req.user.accountId;

        const order = await this.orderService.getById(id);

        if (accountId !== order.buyerId && accountId !== order.sellerId) {
            throw new UnauthorizedException();
        }

        return order;
    }
}
