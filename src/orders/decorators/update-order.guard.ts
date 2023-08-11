import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IdentityVerificationStatus, OrderStatus } from '@prisma/client';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { OrderService } from '../../orders/orders.service';
import { UserService } from '../../user/user.service';
import OrderValidator from '../orders.validator';
import { UpdateOrderDto } from '../dto/update-order.dto';

@Injectable()
export class UpdateOrderAuthorizationGuard implements CanActivate {
    constructor(
        private readonly userService: UserService,
        private readonly orderService: OrderService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest() as RequestWithUser;

        const updateOrderDto = req.body as UpdateOrderDto;

        const user = await this.userService.getById(req.user.id);

        const order = await this.orderService.getById(req.params.id);

        OrderValidator.validateUpdate(order, updateOrderDto, req.user.accountId);

        if (user.idVerificationStatus === IdentityVerificationStatus.Full) {
            return true;
        }

        // We only run verification for accepted order update
        if (req.body.status !== OrderStatus.Accepted) return true;

        // Check that the sum of the purchase orders, sales orders, and the input price does not exceed 10000 dollars
        return false;
    }
}
