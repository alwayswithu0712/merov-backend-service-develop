import { Module } from '@nestjs/common';
import { ConfigService } from 'aws-sdk';
import { CheckDeliveredOrdersTask } from './checkDeliveredOrdersTask';
import { OrdersModule } from '../orders/orders.module';
@Module({
    imports: [OrdersModule],
    providers: [
        ConfigService,
        CheckDeliveredOrdersTask,
    ],
})
export class TasksModule {}
