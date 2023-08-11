import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { ChatController } from './controllers/chats.controller';
import { SendBirdService } from '../shared/services/sendbird.service';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../user/user.module';
import { AccountsModule } from '../accounts/accounts.module';
import { ChatService } from './chats.service';
import { AdminChatController } from './controllers/chats.admin.controller';

@Module({
    imports: [AuthModule, ProductsModule, UsersModule, AccountsModule],
    controllers: [ChatController, AdminChatController],
    providers: [SendBirdService, PrismaService, ChatService],
    exports: [ChatService],
})
export class ChatModule {}
