import { ConfigService } from '@nestjs/config';
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
import { EmailService } from '../../shared/services/email.service';

@Injectable()
export class EmailOrdersListener {
    private readonly logger = new Logger(EmailOrdersListener.name);
    private merovUrl;

    constructor(
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
    ) {
        this.merovUrl = this.configService.get('merov').url;
    }

    @OnEvent(OrderCreated, { async: true })
    async handleOrderCreated(order: Order) {
        this.logger.log(`handleOrderCreated: ${JSON.stringify(order)}`);
        await this.emailService.send(
            order.buyer.email,
            `Order #${order.id} Created`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderCreated: Email sent to ${order.buyer.email}`);
        await this.emailService.send(
            order.seller.email,
            `Order #${order.id} Created`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderCreated: Email sent to ${order.seller.email}`);
    }

    @OnEvent(OrderAccepted, { async: true })
    async handleOrderAccepted(order: Order) {
        this.logger.log(`handleOrderAccepted: ${JSON.stringify(order)}`);
        await this.emailService.send(
            order.buyer.email,
            `Order #${order.id} Accepted`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderAccepted: Email sent to ${order.buyer.email}`);
        await this.emailService.send(
            order.seller.email,
            `Order #${order.id} Accepted`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderAccepted: Email sent to ${order.seller.email}`);
    }

    @OnEvent(OrderPaid)
    handleOrderPaid(order: Order) {
        this.logger.log(`handleOrderPaid: ${JSON.stringify(order)}`);
        this.emailService.send(
            order.buyer.email,
            `Order #${order.id} Paid`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderPaid: Email sent to ${order.buyer.email}`);
        this.emailService.send(
            order.seller.email,
            `Order #${order.id} Paid`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderPaid: Email sent to ${order.seller.email}`);
    }

    @OnEvent(OrderShipped)
    handleOrderShipped(order: Order) {
        this.logger.log(`handleOrderShipped: ${JSON.stringify(order)}`);
        this.emailService.send(
            order.buyer.email,
            `Order #${order.id} Shipped`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderShipped: Email sent to ${order.buyer.email}`);
        this.emailService.send(
            order.seller.email,
            `Order #${order.id} Shipped`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderShipped: Email sent to ${order.seller.email}`);
    }

    @OnEvent(OrderDelivered)
    handleOrderDelivered(order: Order) {
        this.logger.log(`handleOrderDelivered: ${JSON.stringify(order)}`);
        this.emailService.send(
            order.buyer.email,
            `Order #${order.id} Delivered`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderDelivered: Email sent to ${order.buyer.email}`);
        this.emailService.send(
            order.seller.email,
            `Order #${order.id} Delivered`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderDelivered: Email sent to ${order.seller.email}`);
    }

    @OnEvent(OrderClosed)
    handleOrderClosed(order: Order) {
        this.logger.log(`handleOrderClosed: ${JSON.stringify(order)}`);
        this.emailService.send(
            order.buyer.email,
            `Order #${order.id} Closed`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderClosed: Email sent to ${order.buyer.email}`);
        this.emailService.send(
            order.seller.email,
            `Order #${order.id} Closed`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderClosed: Email sent to ${order.seller.email}`);
    }

    @OnEvent(OrderRefunded)
    handleOrderRefunded(order: Order) {
        this.logger.log(`handleOrderRefunded: ${JSON.stringify(order)}`);
        this.emailService.send(
            order.buyer.email,
            `Order #${order.id} Refunded`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderRefunded: Email sent to ${order.buyer.email}`);
        this.emailService.send(
            order.seller.email,
            `Order #${order.id} Refunded`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderRefunded: Email sent to ${order.seller.email}`);
    }

    @OnEvent(OrderDisputed)
    handleOrderDisputed(order: Order) {
        this.logger.log(`handleOrderDisputed: ${JSON.stringify(order)}`);
        this.emailService.send(
            order.buyer.email,
            `Order #${order.id} Disputed`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderDisputed: Email sent to ${order.buyer.email}`);
        this.emailService.send(
            order.seller.email,
            `Order #${order.id} Disputed`,
            `Please go to ${this.merovUrl}/orders/${order.id} to see your order`,
        );
        this.logger.log(`handleOrderDisputed: Email sent to ${order.seller.email}`);
    }
}
