import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
    OrderAccepted,
    OrderClosed,
    OrderCreated,
    OrderDelivered,
    OrderDisputed,
    OrderPaid,
    OrderRefunded,
    OrderShipped,
} from '../../shared/events';
import { Order } from '../dto/order';
import { NotificationsService } from "../../notifications/notifications.service";

@Injectable()
export class NotificationsOrdersListener {
    private readonly logger = new Logger(NotificationsOrdersListener.name);

    constructor(private readonly notificationsService: NotificationsService) {
    }

    notifyOrder = async (order: Order, userId: string, status: string) => {
        await this.notificationsService.create(userId, {
            userId: userId,
            createdAt: new Date(),
            title: status,
            message: status,
            type: status,
            metadata: {
                sellerId: order.seller.id,
                buyerId: order.buyer.id,
                orderId: order.id,
                sellerName: order.seller.name,
                buyerName: order.buyer.name,
                productName: order.product.title,
            }
        })
    }

    @OnEvent(OrderCreated, { async: true })
    async handleOrderCreated(order: Order) {
        this.logger.log(`handleOrderCreated: ${JSON.stringify(order)}`);
        await this.notifyOrder(order, order.seller.id, OrderCreated);
    }

    @OnEvent(OrderAccepted, { async: true })
    async handleOrderAccepted(order: Order) {
        this.logger.log(`handleOrderAccepted: ${JSON.stringify(order)}`);
        await this.notifyOrder(order, order.buyer.id, OrderAccepted);
    }

    @OnEvent(OrderPaid)
    handleOrderPaid(order: Order) {
        this.logger.log(`handleOrderPaid: ${JSON.stringify(order)}`);
        this.notifyOrder(order, order.buyer.id, OrderPaid);
        this.notifyOrder(order, order.seller.id, OrderPaid);
    }

    @OnEvent(OrderShipped)
    handleOrderShipped(order: Order) {
        this.logger.log(`handleOrderShipped: ${JSON.stringify(order)}`);
        this.notifyOrder(order, order.buyer.id, OrderShipped);
    }

    @OnEvent(OrderDelivered)
    handleOrderDelivered(order: Order) {
        this.logger.log(`handleOrderDelivered: ${JSON.stringify(order)}`);
        this.notifyOrder(order, order.buyer.id, OrderDelivered);
        this.notifyOrder(order, order.seller.id, OrderDelivered);
    }

    @OnEvent(OrderClosed)
    handleOrderClosed(order: Order) {
        this.logger.log(`handleOrderClosed: ${JSON.stringify(order)}`);
        this.notifyOrder(order, order.buyer.id, OrderClosed);
        this.notifyOrder(order, order.seller.id, OrderClosed);
    }

    @OnEvent(OrderRefunded)
    handleOrderRefunded(order: Order) {
        this.logger.log(`handleOrderRefunded: ${JSON.stringify(order)}`);
        this.notifyOrder(order, order.buyer.id, OrderRefunded);
        this.notifyOrder(order, order.seller.id, OrderRefunded);
    }

    @OnEvent(OrderDisputed)
    handleOrderDisputed(order: Order) {
        this.logger.log(`handleOrderDisputed: ${JSON.stringify(order)}`);
        this.notifyOrder(order, order.buyer.id, OrderDisputed);
        this.notifyOrder(order, order.seller.id, OrderDisputed);
    }
}
