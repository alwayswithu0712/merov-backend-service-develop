import { CacheModule, HttpException, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import config from './config/config';
import { UsersModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { AppController } from './app.controller';
import { PrismaService } from './shared/services/prisma.service';
import { CurrenciesService } from './currencies/currencies.service';
import { ErbnService } from './shared/services/erbn.service';
import { ChatModule } from './chats/chats.module';
import { OffersModule } from './offer/offers.module';
import { AdminModule } from './admin/admin.module';
import { HttpLoggerMiddleware } from './shared/middlewares/logger.middleware';
import { ImagesModule } from './images/images.module';
import { VerificationsModule } from './verifications/verifications.module';
import { TransactionModule } from './transaction/transaction.module';
import { EscrowModule } from './escrow/escrow.module';
import { ContactFormModule } from './contact-form/contact-form.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Auth0Service } from './shared/services/auth0.service';
import { TasksModule } from './task/tasks.module';
import { SubscriptionEmailModule } from './subscription-email/subscription-email.module';
import { BlogModule } from './blog/blog.module';
import { AccountsModule } from './accounts/accounts.module';


import { EventEmitterModule } from '@nestjs/event-emitter';
import { SentryInterceptor, SentryModule } from '@ntegral/nestjs-sentry';
import { CorrelationIdMiddleware } from './shared/middlewares/correlation-id.middleware';
import { SentryMiddleware } from './shared/middlewares/sentry.middleware';
import * as Tracing from '@sentry/tracing';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
    imports: [
        EventEmitterModule.forRoot(
          {
              wildcard: true,
              delimiter: '.',
          }
        ),
        AuthModule,
        AdminModule,
        CurrenciesModule,
        OffersModule,
        UsersModule,
        VerificationsModule,
        ProductsModule,
        OrdersModule,
        ChatModule,
        ImagesModule,
        TransactionModule,
        EscrowModule,
        SubscriptionEmailModule,
        BlogModule,
        ContactFormModule,
        WebhooksModule,
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 10,
        }),
        ConfigModule.forRoot({
            load: [config],
            isGlobal: true,
        }),
        CacheModule.register({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        NotificationsModule,
        TasksModule,
        SentryModule.forRootAsync({
            useFactory: async (prismaService: PrismaService) => {
                return {
                    dsn: process.env.SENTRY_DSN,
                    environment: process.env.NODE_ENV,
                    serverName: 'merov-backend',
                    tracesSampleRate: 1.0,
                    integrations: [new Tracing.Integrations.Prisma({ client: prismaService })],
                };
            },
        }),
        AccountsModule,
        OrganizationsModule
    ],
    controllers: [AppController],
    providers: [
        JwtService,
        PrismaService,
        Auth0Service,
        ErbnService,
        CurrenciesService,
        {
            provide: APP_INTERCEPTOR,
            useValue: new SentryInterceptor({
                filters: [
                    {
                        type: HttpException,
                        filter: (exception: HttpException) => {
                            return 500 > exception.getStatus();
                        },
                    },
                ],
            }),
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(CorrelationIdMiddleware, SentryMiddleware, HttpLoggerMiddleware).forRoutes('*');
    }
}
