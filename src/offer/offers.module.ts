import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { AccountsModule } from '../accounts/accounts.module';
import { UsersModule } from '../user/user.module';
import { Auth0Service } from '../shared/services/auth0.service';
import { ProductsModule } from '../products/products.module';
import { SendBirdService } from '../shared/services/sendbird.service';
import { CurrenciesService } from '../currencies/currencies.service';

@Module({
    imports: [AuthModule, ProductsModule, AccountsModule, UsersModule],
    controllers: [OffersController],
    providers: [PrismaService, OffersService, SendBirdService, Auth0Service, CurrenciesService],
    exports: [OffersService],
})
export class OffersModule {}
