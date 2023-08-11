import { Injectable, Logger } from "@nestjs/common";
import { Order } from '../dto/order';
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "../../shared/services/prisma.service";

@Injectable()
export class OrderUpdateListener {
    private readonly logger = new Logger(OrderUpdateListener.name);

    constructor(private readonly prismaService: PrismaService) {}

    @OnEvent('order.*', { async: true })
    async handleOrderUpdated(order: Order): Promise<void> {
        this.logger.log(`handleOrderUpdated: Order ID: ${order.id} Status: ${order.status}`);
        await this.prismaService.orderUpdate.create({
            data: {
                orderId: order.id,
                status: order.status,
            }
        })
    }
}