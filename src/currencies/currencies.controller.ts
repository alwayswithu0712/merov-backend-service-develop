import { CacheInterceptor, Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';

@Controller('currencies')
@ApiTags('Currencies')
@UseInterceptors(CacheInterceptor)
export class CurrenciesController {
    constructor(private readonly currenciesService: CurrenciesService) {}

    @Get(':id/price')
    async getPrice(@Param('id') id: string) {
        return this.currenciesService.getPrice(id);
    }
}
