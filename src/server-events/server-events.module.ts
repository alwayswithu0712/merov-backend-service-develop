import { Global, Module } from '@nestjs/common';
import { ServerEventsService } from './server-events.service';

@Global()
@Module({
  providers: [ServerEventsService],
  exports: [ServerEventsService],
})
export class ServerEventsModule {}