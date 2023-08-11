import { Module } from '@nestjs/common';
import { CurrenciesService } from '../currencies/currencies.service';
import { ErbnService } from '../shared/services/erbn.service';
import { TransactionController } from './transaction.controller';

@Module({
    imports: [],
    controllers: [TransactionController],
    providers: [ErbnService, CurrenciesService],
})
export class TransactionModule {}
