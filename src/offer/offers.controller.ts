import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { OfferStatus } from '@prisma/client';
import { GetOrderPagination } from '../orders/decorators/orders.pagination.decorator';
import { PaginatedResponse } from '../shared/typings/paginatedResponse';
import { Pagination } from '../shared/typings/pagination';

import { RequestWithUser } from '../auth/typings/requestWithUser';
import { CreateOfferDto } from './dto/create-offers.dto';
import { OffersService } from './offers.service';
import { JoiValidationPipe } from '../shared/pipes/validation.pipe';
import { updateOfferSchema } from './schema/update-offer.schema';
import { PriceValidationPipe } from '../shared/pipes/price-validation.pipe';
import { Offer } from './dto/offer';
import PermissionGuard from '../shared/pipes/permissions.guard';
import { Permission } from '../shared/typings';
import { OptionalAuthGuard } from '../shared/pipes/optional-auth.guard';

@Controller('offers')
@ApiTags('offers')
@UseGuards(OptionalAuthGuard)
export class OffersController {
    constructor(private readonly offersService: OffersService) {}

    @Post()
    @UseGuards(PermissionGuard([Permission.Offers]))
    async create(@Req() req: RequestWithUser, @Body(PriceValidationPipe) createOfferDto: CreateOfferDto): Promise<Offer> {
        const accountId = req.user.accountId;
        return this.offersService.create(createOfferDto, accountId);
    }

    @Get('active')
    @UseGuards(PermissionGuard([Permission.Offers]))
    async getByAccountActive(@Req() req: RequestWithUser, @GetOrderPagination() pagination: Pagination): Promise<PaginatedResponse<Offer>> {
        const accountId = req.user.accountId;
        const params = {
            where: {
                sellerId: accountId,
                status: OfferStatus.Active,
            },
            ...pagination,
        };
        return this.offersService.findAll(params);
    }

    @Get('expired')
    @UseGuards(PermissionGuard([Permission.Offers]))
    async getByUserExpired(
        @Req() req: RequestWithUser,
        @GetOrderPagination() pagination: Pagination,
    ): Promise<PaginatedResponse<Offer>> {
        const params = {
            where: {
                sellerId: req.user.accountId,
                status: OfferStatus.Expired,
            },
            ...pagination,
        };
        return this.offersService.findAll(params);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<Offer> {
        const offer = await this.offersService.getById(id);

        if (offer.status === OfferStatus.Closed) {
            throw new NotFoundException();
        }

        return this.offersService.getById(id);
    }

    @Patch(':id')
    @UseGuards(PermissionGuard([Permission.Offers]))
    async update(@Req() req: RequestWithUser, @Param('id') id: string, @Body(new JoiValidationPipe(updateOfferSchema)) updateOfferDto): Promise<Offer> {
        const offer = await this.offersService.getById(id);

        if (offer.sellerId !== req.user.accountId) {
            throw new UnauthorizedException();
        }

        return this.offersService.update(id, updateOfferDto);
    }
}
