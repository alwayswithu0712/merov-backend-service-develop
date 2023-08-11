import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MerovConfig } from '../../config/config.interface';
import { CurrenciesService } from '../../currencies/currencies.service';

@Injectable()
export class PriceValidationPipe implements PipeTransform {
    private merovConfig: MerovConfig;

    constructor(
        private readonly configService: ConfigService, 
        private readonly currenciesService: CurrenciesService) {
        this.merovConfig = this.configService.get<MerovConfig>('merov');
    }

    async transform(value: any) {
        if (value.price && value.currency) {
            const minPrice = this.merovConfig.product.minPrice;
            const exchangeRate = await this.currenciesService.getPrice(value.currency);
            const priceInUsd = value.price * exchangeRate;
    
            if (priceInUsd < minPrice) throw new BadRequestException(`Price must be greater than $${minPrice}!`);
        } else if (value.price && !value.currency) {
            throw new BadRequestException(`Currency is required!`);
        } else if (!value.price && value.currency) {
            throw new BadRequestException(`Price is required!`);
        }

        return value;
    }
}
