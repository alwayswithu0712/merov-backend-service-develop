import { Module } from '@nestjs/common';
import { CurrenciesService } from '../currencies/currencies.service';
import { ProductsService } from '../products/products.service';
import { ErbnService } from '../shared/services/erbn.service';
import { PrismaService } from '../shared/services/prisma.service';
import { OrderController } from './controllers/orders.controller';
import { OrderService } from './orders.service';
import { AuthModule } from '../auth/auth.module';
import { DisputesController } from './controllers/disputes.controller';
import { DisputesService } from './disputes.service';
import { OffersModule } from '../offer/offers.module';
import { EmailService } from '../shared/services/email.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationsOrdersListener } from './listeners/order.listener.notification';
import { EmailOrdersListener } from './listeners/order.listener.email';
import { AdminOrderController } from './controllers/orders.admin.controller';
import { UsersModule } from '../user/user.module';
import { ChatModule } from '../chats/chats.module';
import { ReviewService } from './review.service';
import { OpensearchService } from '../shared/services/opensearch.service';
import { OrderUpdateListener } from './listeners/order.listener.updates';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
    imports: [AuthModule, OffersModule, NotificationsModule, UsersModule, AccountsModule, ChatModule],
    controllers: [AdminOrderController, OrderController, DisputesController],
    providers: [
        ErbnService,
        ProductsService,
        PrismaService,
        CurrenciesService,
        OrderService,
        ReviewService,
        DisputesService,
        EmailService,
        NotificationsOrdersListener,
        EmailOrdersListener,
        OpensearchService,
        OrderUpdateListener,
    ],
    exports: [OrderService, ReviewService, DisputesService],
})
export class OrdersModule {}
