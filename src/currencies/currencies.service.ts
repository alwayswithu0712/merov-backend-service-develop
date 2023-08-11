import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Currency } from '../shared/typings';
import axios from 'axios';

@Injectable()
export class CurrenciesService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager) {}
    private readonly logger = new Logger(CurrenciesService.name);

    getCoingeckoId(currency: Currency): string {
        switch (currency) {
            case Currency.BTC:
                return 'bitcoin';
            case Currency.ETH:
                return 'ethereum';
            case Currency.MATIC:
                return 'matic-network';
            case Currency.BNB:
                return 'binancecoin'
            default:
                throw new Error(`Unsupported currency: ${currency}`);
        }
    }

    async getPrice(currency): Promise<number> {
        const value = await this.cacheManager.get(`getPrice/${currency}`);

        if (value) {
            return value;
        }

        if (this.isUsd(currency)) return 1;

        const coingeckoId = this.getCoingeckoId(currency);

        const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`);
        await this.cacheManager.set(`getPrice/${currency}`, data[coingeckoId].usd, { ttl: 60 });
        return data[coingeckoId].usd;
    }

    isUsd(currency: Currency): boolean {
        return currency === Currency.USDT || currency === Currency.USDC;
    }
}
