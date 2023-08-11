import { BadRequestException, PreconditionFailedException, UnauthorizedException } from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';
import { UpdateOrderDto } from './dto/update-order.dto';


export default class OrderValidator {

    public static activeStatusList: OrderStatus[] = [
        OrderStatus.Created,
        OrderStatus.Delivered,
        OrderStatus.Accepted,
        OrderStatus.Paid,
        OrderStatus.Shipped,
        OrderStatus.Disputed,
        OrderStatus.EscrowPaymentFailed
    ]
    
    public static completedStatusList: OrderStatus[] = [
        OrderStatus.Closed,
        OrderStatus.Refunded,
        OrderStatus.Completed,
    ]

    public static disputableStatusList: OrderStatus[] = [
        OrderStatus.Paid,
        OrderStatus.Shipped,
        OrderStatus.Delivered,
    ]

    public static readonly validFrom: { [status: string]: string[] } = {
        [OrderStatus.Created]: [OrderStatus.Accepted, OrderStatus.Closed],
        [OrderStatus.Accepted]: [OrderStatus.Paid, OrderStatus.Closed],
        [OrderStatus.Paid]: [OrderStatus.Shipped, OrderStatus.Disputed, OrderStatus.Closed],
        [OrderStatus.Shipped]: [OrderStatus.Delivered, OrderStatus.Disputed],
        [OrderStatus.Delivered]: [OrderStatus.Disputed, OrderStatus.Completed],
        [OrderStatus.Disputed]: [OrderStatus.Refunded, OrderStatus.Completed],
    }

    public static validateUpdate = (order: Order, orderUpdate: UpdateOrderDto, userId: string) => {
        OrderValidator.validateForbiddenStatus(orderUpdate);
        OrderValidator.validateUser(order, userId);
        OrderValidator.validateCloseable(orderUpdate, order);
        OrderValidator.validateDisputable(orderUpdate, order);

        if (OrderValidator.isCreated(order.status)) {
            return OrderValidator.validateCreatedUpdate(orderUpdate, order, userId);
        } else if (OrderValidator.isAccepted(order.status)) {
            return OrderValidator.validateAcceptedUpdate(orderUpdate, order);
        } else if (OrderValidator.isPaid(order.status)) {
            return OrderValidator.validatePaidUpdate(orderUpdate, order, userId);
        } else if (OrderValidator.isShipped(order.status)) {
            return OrderValidator.validateShippedUpdate(orderUpdate, order, userId);
        } else if (OrderValidator.isDisputed(order.status)) {
            return OrderValidator.validateDisputedUpdate(orderUpdate, order);
        }

        return false;
    };

    public static isCreated = (status: OrderStatus) => status === OrderStatus.Created;
    public static isAccepted = (status: OrderStatus) => status === OrderStatus.Accepted;
    public static isPaid = (status: OrderStatus) => status === OrderStatus.Paid;
    public static isShipped = (status: OrderStatus) => status === OrderStatus.Shipped;
    public static isDelivered = (status: OrderStatus) => status === OrderStatus.Delivered;
    public static isDisputed = (status: OrderStatus) => status === OrderStatus.Disputed;
    public static isRefunded = (status: OrderStatus) => status === OrderStatus.Refunded;
    public static isClosed = (status: OrderStatus) => status === OrderStatus.Closed;

    public static isCloseable = (status: string) => status === OrderStatus.Created || status === OrderStatus.Accepted || status === OrderStatus.Paid;
    public static isDisputable = (status: OrderStatus) => OrderValidator.disputableStatusList.includes(status);
    public static isActive = (status: OrderStatus) => OrderValidator.activeStatusList.includes(status);

    private static validateForbiddenStatus = (orderUpdate: UpdateOrderDto) => {

        const forbiddenStatus: string[] = [OrderStatus.Paid, OrderStatus.Refunded];

        if (forbiddenStatus.includes(orderUpdate.status)) {
            throw new BadRequestException('Forbidden status');
        }
        return true;
    }

    private static validateUser = (order: Order, userId: string) => {

        if (![order.buyerId, order.sellerId].includes(userId)) {
            throw new UnauthorizedException('You are not authorized to accessthis order');
        }

        return true;
    }

    public static validateCloseable = (orderUpdate: UpdateOrderDto, order: Order) => {

        if (orderUpdate.status === OrderStatus.Closed && !this.isCloseable(order.status)) {
            throw new BadRequestException('Order cannot be closed');
        }

        return true;
    }

    public static validateDisputable = (orderUpdate: UpdateOrderDto, order: Order) => {

        if (orderUpdate.status === OrderStatus.Disputed && !this.isDisputable(order.status)) {
            throw new BadRequestException('Order cannot be disputed');
        }

        return true;
    }

    private static validateCreatedUpdate = (orderUpdate: UpdateOrderDto, order: Order, userId: string) => {

        if (!OrderValidator.validFrom[OrderStatus.Created].includes(orderUpdate.status)) {
            throw new BadRequestException(`Invalid status update ${order.status} => ${orderUpdate.status}`);
        }

        if (userId === order.buyerId && orderUpdate.status !== OrderStatus.Closed) {
            throw new UnauthorizedException('Buyer has no permission to update order');
        }

        return true;
    };

    private static validateAcceptedUpdate = (orderUpdate: UpdateOrderDto, order: Order) => {

        if (!OrderValidator.validFrom[OrderStatus.Accepted].includes(orderUpdate.status)) {
            throw new BadRequestException(`Invalid status update ${order.status} => ${orderUpdate.status}`);
        }

        return true;
    };


    private static validatePaidUpdate = (orderUpdate: UpdateOrderDto, order: Order, userId: string) => {

        if (!OrderValidator.validFrom[OrderStatus.Paid].includes(orderUpdate.status)) {
            throw new BadRequestException(`Invalid status update ${order.status} => ${orderUpdate.status}`);
        }

        if (orderUpdate.status === OrderStatus.Shipped && !orderUpdate.trackingNumber) {
            throw new BadRequestException('Tracking number is required');
        }

        return true;
    };

    private static validateShippedUpdate = (orderUpdate: UpdateOrderDto, order: Order, userId: string) => {

        if (!OrderValidator.validFrom[OrderStatus.Shipped].includes(orderUpdate.status)) {
            throw new BadRequestException(`Invalid status update ${order.status} => ${orderUpdate.status}`);
        }

        if (!order.escrowId) {
            throw new PreconditionFailedException('Order has no escrowId');
        }

        if (userId === order.sellerId) {
            throw new UnauthorizedException('Seller has no permission to update order');
        }

        return true;
    };

    private static validateDisputedUpdate = (orderUpdate: UpdateOrderDto, order: Order) => {

        if (!OrderValidator.validFrom[OrderStatus.Disputed].includes(orderUpdate.status)) {
            throw new BadRequestException(`Invalid status update ${order.status} => ${orderUpdate.status}`);
        }

        if (!order.escrowId) {
            throw new PreconditionFailedException('Order has no escrowId');
        }

        return true;
    };
}
