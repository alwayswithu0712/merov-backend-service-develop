import { Module } from '@nestjs/common';
import { CurrenciesService } from '../currencies/currencies.service';
import { ErbnService } from '../shared/services/erbn.service';
import { EscrowController } from './escrow.controller';

@Module({
    imports: [],
    controllers: [EscrowController],
    providers: [ErbnService, CurrenciesService],
})
export class EscrowModule {}
