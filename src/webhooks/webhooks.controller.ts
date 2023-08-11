import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestWithUser } from '../auth/typings/requestWithUser';
import { SardineSignatureGuard } from './sardine-signature.guard';
import { MiddeskWebhookEvent } from '../middesk/dto/webhook-event';
import { SardineWebhookEvent } from '../sardine/dto/webook-event';

@Controller('webhooks')
export class WebhooksController {
    constructor(private eventEmitter: EventEmitter2) {}

    @Post('sardine/events')
    @UseGuards(SardineSignatureGuard())
    async sardine(@Body() event: SardineWebhookEvent): Promise<void> {
        this.eventEmitter.emit(`sardine.${event.type}`, event);
    }

    @Post('erbn/events')
    async erbn(@Req() req: RequestWithUser): Promise<void> {
        const { event, data } = req.body;
        this.eventEmitter.emit(event, data);
    }

    @Post('middesk/events')
    async middesk(@Body() event: MiddeskWebhookEvent): Promise<void> {
        this.eventEmitter.emit(`middesk.${event.type}`, event);
    }
}
