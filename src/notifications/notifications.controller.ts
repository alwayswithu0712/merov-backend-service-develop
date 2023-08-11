import {Controller, Get, Inject, Logger, MessageEvent, Param, Post, Req, Res, Sse, UseGuards} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {NotificationsService} from "./notifications.service";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../auth/typings/requestWithUser";
import {NotificationDto} from "./dto/notification.dto";
import {Observable} from "rxjs";
import { ServerEventsService } from '../server-events/server-events.service';
import { randomUUID } from 'crypto';

@Controller('notifications')
@ApiTags('Notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService, 
        @Inject(ServerEventsService) private readonly eventsService: ServerEventsService) {}

    private logger = new Logger(NotificationsController.name);

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async get(@Req() req: RequestWithUser): Promise<NotificationDto[]> {
        const userId = req.user.id;

        return this.notificationsService.getAll(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post("/:notificationId/read")
    async markAsRead(@Req() req: RequestWithUser, @Param("notificationId") notificationId: string): Promise<void> {
        const userId = req.user.id;
        return this.notificationsService.markAsRead(userId, notificationId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get("/unread")
    async getUnread(@Req() req: RequestWithUser): Promise<NotificationDto[]> {
        const userId = req.user.id;
        return this.notificationsService.getUnread(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get("/unread/count")
    async getUnreadCount(@Req() req: RequestWithUser): Promise<number> {
        const userId = req.user.id;
        return this.notificationsService.getUnreadCount(userId);
    }

    @Sse("/stream/:userId")
    sse(@Res() response, @Param("userId") userId: string): Observable<MessageEvent> {
        const requestId = randomUUID()

        this.logger.log(`User ${userId} connected to SSE with request id ${requestId}`);

        response.on('close', () => {
            this.logger.log(`User ${userId} disconnected from SSE with request id ${requestId}`);
            this.eventsService.remove(userId, requestId)
        });

        return this.eventsService.send(userId, requestId);
    }
}
