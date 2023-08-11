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
    SerializeOptions,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderService } from '../orders.service';
import { createOrderSchema } from '../schema/create-order.schema';
import { updateOrderSchema } from '../schema/update-review.schema';
import { Pagination } from '../../shared/typings/pagination';
import { GetOrderPagination } from '../decorators/orders.pagination.decorator';
import { PaginatedResponse } from '../../shared/typings/paginatedResponse';
import { Order } from '../dto/order';
import RoleGuard from '../../auth/role.guard';
import { Role } from '../../auth/typings/role';
import { MEROV_ADMIN } from '../../shared/typings/groups';
import { OrderUpdate } from '@prisma/client';

@Controller('admin/orders')
@ApiTags('Orders')
@UseGuards(AuthGuard('jwt'))
@UseGuards(RoleGuard(Role.MerovAdmin))
@SerializeOptions({ groups: [MEROV_ADMIN] })
export class AdminOrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    @UsePipes(new JoiValidationPipe(createOrderSchema))
    async create(@Req() req: RequestWithUser, @Body() createOrderDto: CreateOrderDto): Promise<Order> {
        const accountId = req.user.accountId;

        if (createOrderDto.offerId) {
            return this.orderService.createFromOffer(createOrderDto, accountId);
        }

        return this.orderService.createFromProduct(createOrderDto, accountId);
    }

    @Patch('/:id')
    async update(
        @Param('id') id: string,
        @Body(new JoiValidationPipe(updateOrderSchema)) updateOrderDto: UpdateOrderDto,
    ): Promise<Order> {
        return this.orderService.update(id, updateOrderDto);
    }

    @Get()
    async get(@GetOrderPagination() pagination: Pagination): Promise<PaginatedResponse<Order>> {
        return this.orderService.findAll(pagination);
    }

    @Get('/:id/history')
    async getOrderHistory(@Param('id') id: string): Promise<OrderUpdate[]> {
        return this.orderService.getOrderHistory(id);
    }

    @Get('/:id')
    async getById(@Param('id') id: string): Promise<Order> {
        return this.orderService.getById(id);
    }
}
