import { Module } from '@nestjs/common';

import { SendBirdService } from '../shared/services/sendbird.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../shared/services/prisma.service';
import { AccountsController } from './controllers/accounts.controller';
import { AdminAccountsController } from './controllers/accounts.admin.controller';
import { MyAccountController } from './controllers/accounts.me.controller';
import { AccountsService } from './accounts.service';
import { AddressesService } from './addresses.service';
import { ReviewsService } from './reviews.service';
import { WalletsService } from './wallets.service';

@Module({
    imports: [AuthModule],
    controllers: [AccountsController, AdminAccountsController, MyAccountController],
    providers: [AccountsService, AddressesService, ReviewsService, WalletsService, PrismaService, SendBirdService],
    exports: [AccountsService, AddressesService],
})
export class AccountsModule {}
