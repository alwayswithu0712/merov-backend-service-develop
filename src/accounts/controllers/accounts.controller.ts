import { Controller, Get, Param, Logger, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { OrderReview } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { ReviewsService } from '../reviews.service';
import { AccountsService } from '../accounts.service';
import { Account } from '../dto/account.dto';

@Controller('accounts')
@ApiTags('Accounts')
@UseInterceptors(ClassSerializerInterceptor)
export class AccountsController {
    private readonly logger = new Logger(AccountsController.name);

    constructor(private readonly reviewsService: ReviewsService, private readonly accountsService: AccountsService) {}

    @Get(':name')
    async getByName(@Param('name') name: string): Promise<Account> {
        return this.accountsService.getByName(name);
    }

    @Get(':id/reviews')
    async getReviewsByUserId(@Param('id') id: string): Promise<OrderReview[]> {
        return this.reviewsService.getById(id);
    }

}
