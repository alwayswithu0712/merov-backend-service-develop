import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { OrderStatus } from '@prisma/client';
import { CronJob } from 'cron';
import { OrderService } from '../orders/orders.service';
import { Order } from '../orders/dto/order';

//// task check for orders shipped and not disputed and move to delivered.
@Injectable()
export class CheckDeliveredOrdersTask implements OnModuleInit {
    private readonly logger = new Logger(CheckDeliveredOrdersTask.name);
    private deliveredJob: CronJob;
    private completedJob: CronJob;

    constructor(
        private orderService: OrderService,
        private readonly schedulerRegistry: SchedulerRegistry
    ) {}

    onModuleInit() {
        this.deliveredJob = new CronJob(CronExpression.EVERY_30_MINUTES, () => this.run(), null, true);
        this.completedJob = new CronJob(CronExpression.EVERY_HOUR, () => this.runDeliveredJob(), null, true);
        this.schedulerRegistry.addCronJob(`run CheckDeliveredOrdersTask`, this.deliveredJob);
    }

    stop = () => {
        this.deliveredJob.stop();
        this.logger.log('CheckDeliveredOrdersTask stopped');
        this.completedJob.stop();
        this.logger.log('CheckCompletedOrdersTask stopped');
    };

    run = async (): Promise<void> => {
        this.deliveredJob.stop();
        this.logger.log('Checking for delivered orders');
        const failedOrderIds: string[] = [];

        try {
            const shippedOrders = await this.orderService.findAll({
                where: {
                    status: OrderStatus.Shipped,
                },
            });

            const ordersToUpdateToDelivered = shippedOrders.response.filter(
                (o) => this.isDeliveredPeriodOver(o) && !failedOrderIds.includes(o.id),
            );

            for (let i = 0; i < ordersToUpdateToDelivered.length; i++) {
                const order = ordersToUpdateToDelivered[i];
                this.logger.log(`Updating order ${order.id} to delivered`);
                try {
                    await this.orderService.update(order, { status: OrderStatus.Delivered });
                } catch (e) {
                    this.logger.error(`Error updating order ${order.id} to delivered: ${e}`);
                    failedOrderIds.push(order.id);
                }
            }
        } catch (error) {
            this.logger.error(`Error in check delivered orders task ${error}`);
            // notify that service is down
        } finally {
            this.deliveredJob.start();
        }
    };

    runDeliveredJob = async (): Promise<void> => {
        this.completedJob.stop();
        this.logger.log('Checking for completed orders');
        const failedOrderIds: string[] = [];

        try {
            const deliveredOrders = await this.orderService.findAll({
                where: {
                    status: OrderStatus.Delivered,
                },
            });

            const ordersToUpdateToCompleted = deliveredOrders.response.filter(
                (o) => this.isOrderDisputePeriodOver(o) && !failedOrderIds.includes(o.id),
            ).filter(o => o.escrowId !== null);

            for (let i = 0; i < ordersToUpdateToCompleted.length; i++) {
                const order = ordersToUpdateToCompleted[i];
                this.logger.log(`Updating order ${order.id} to completed`);
                try {
                    await this.orderService.update(order, { status: OrderStatus.Completed });
                } catch (e) {
                    this.logger.error(`Error updating order ${order.id} to completed: ${e}`);
                    failedOrderIds.push(order.id);
                }
            }
        } catch (error) {
            this.logger.error(`Error in check completed orders task ${error}`);
            // notify that service is down
        } finally {
            this.completedJob.start();
        }
    };

    isDeliveredPeriodOver(order: Order): boolean {
        const { shippedAt, maxShippingDurationInDays } = order;

        if (!shippedAt) return false;

        const deliveredPeriodEnd = new Date(shippedAt.getTime() + maxShippingDurationInDays * 24 * 60 * 60 * 1000);
        const now = new Date();

        return now > deliveredPeriodEnd;
    }

    isOrderDisputePeriodOver(order: Order): boolean {
        const { deliveredAt, maxTestingTime } = order;
        if (!deliveredAt) return false;

        const disputePeriodEnd = new Date(deliveredAt.getTime() + maxTestingTime * 24 * 60 * 60 * 1000);
        const now = new Date();

        return now > disputePeriodEnd;
    }
}
