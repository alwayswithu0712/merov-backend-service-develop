import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';

@Module({
    imports: [],
    controllers: [WebhooksController],
    providers: [],
})
export class WebhooksModule {}
