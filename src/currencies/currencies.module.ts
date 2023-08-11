import { CacheModule, Module } from '@nestjs/common';

import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';

@Module({
    imports: [CacheModule.register({ ttl: 100, max: 100 })],
    controllers: [CurrenciesController],
    providers: [CurrenciesService],
})
export class CurrenciesModule {}
