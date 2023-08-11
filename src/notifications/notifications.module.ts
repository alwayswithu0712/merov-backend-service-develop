import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { FirebaseService } from './firebase.service';
import { UsersModule } from '../user/user.module';
import { PrismaService } from '../shared/services/prisma.service';
import { SendBirdService } from '../shared/services/sendbird.service';
import { ServerEventsModule } from '../server-events/server-events.module';

@Module({
    imports: [ServerEventsModule, UsersModule],
    controllers: [NotificationsController],
    providers: [FirebaseService, PrismaService, SendBirdService, NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule {}
