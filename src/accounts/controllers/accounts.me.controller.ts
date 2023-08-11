import {
    Controller,
    Get,
    Param,
    Logger,
    Req,
    Post,
    UsePipes,
    Body,
    Patch,
    NotFoundException,
    Delete,
    UseInterceptors,
} from '@nestjs/common';
import { Address, Wallet, OrderReview } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from '../accounts.service';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { WalletsService } from '../wallets.service';
import { JoiValidationPipe } from 'src/shared/pipes/validation.pipe';
import { createAccountAddressSchema } from '../schema/create-account-address.schema';
import { CreateAddressDto } from '../dto/create-address.dto';
import { updateAccountAddressSchema } from '../schema/update-account-address.schema';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressesService } from '../addresses.service';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import PermissionGuard from '../../shared/pipes/permissions.guard';
import { Permission } from '../../shared/typings';
import { Account } from '../dto/account.dto';
import { ReviewsService } from '../reviews.service';
import { PermissionsSerializerInterceptor } from 'src/shared/interceptors/class-serializer.interceptors';
import { updateAccountSchema } from '../schema/account-user.schema';
import { UpdateAccountDto, UpdateAccountMeDto } from '../dto/update-account.dto';

@Controller('accounts/me')
@ApiTags('Accounts')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(PermissionsSerializerInterceptor)
export class MyAccountController {
    private readonly logger = new Logger(MyAccountController.name);

    constructor(
        private readonly accountsService: AccountsService,
        private readonly walletsService: WalletsService,
        private readonly addressesService: AddressesService,
        private readonly reviewsService: ReviewsService,
    ) {}

    @Get()
    async get(@Req() req: RequestWithUser): Promise<Account> {
        return this.accountsService.getById(req.user.accountId);
    }

    @Patch()
    @UsePipes(new JoiValidationPipe(updateAccountSchema))
    async patch(@Req() req: RequestWithUser, @Body() body: UpdateAccountMeDto): Promise<Account> {
        return this.accountsService.update(req.user.accountId, body);
    }

    @Get('addresses')
    @UseGuards(PermissionGuard([Permission.Addresses, Permission.Products]))
    async getDeliveryAddresses(@Req() req: RequestWithUser): Promise<Address[]> {
        return this.addressesService.findAll({ where: { accountId: req.user.accountId } });
    }

    @Get('addresses')
    @UseGuards(PermissionGuard([Permission.Addresses]))
    async getDeliveryAddress(@Param('addressId') addressId: string): Promise<Address> {
        return this.addressesService.getById(addressId);
    }

    @Post('addresses')
    @UseGuards(PermissionGuard([Permission.Addresses]))
    @UsePipes(new JoiValidationPipe(createAccountAddressSchema))
    async createAddress(@Req() req: RequestWithUser, @Body() address: CreateAddressDto): Promise<Address> {
        return this.addressesService.create(address, req.user.accountId);
    }

    @Patch('addresses/:addressId')
    @UseGuards(PermissionGuard([Permission.Addresses]))
    async updateAddress(
        @Param('addressId') addressId: string,
        @Body(new JoiValidationPipe(updateAccountAddressSchema)) address: UpdateAddressDto,
    ): Promise<Address> {
        if (!(await this.addressesService.getById(addressId))) {
            throw new NotFoundException(`Address not found`);
        }

        return this.addressesService.update(addressId, address);
    }

    @Delete('addresses/:addressId')
    @UseGuards(PermissionGuard([Permission.Addresses]))
    async deleteAddress(@Req() req: RequestWithUser, @Param('addressId') addressId: string): Promise<void> {
        const addresses = await this.addressesService.findAll({ where: { accountId: req.user.accountId } });

        if (!addresses.find((address) => address.id === addressId)) {
            throw new NotFoundException(`Address not found`);
        }

        return this.addressesService.delete(addressId);
    }

    @Get('wallets')
    @UseGuards(PermissionGuard([Permission.Wallets, Permission.Products]))
    async getWallets(@Req() req: RequestWithUser): Promise<Wallet[]> {
        return this.walletsService.findAll({ where: { accountId: req.user.accountId } });
    }

    @Post('wallets')
    @UseGuards(PermissionGuard([Permission.Wallets]))
    async createWallet(@Req() req: RequestWithUser, @Body() wallet: CreateWalletDto): Promise<Wallet> {
        return this.walletsService.create(wallet, req.user.accountId);
    }

    @Delete('wallets/:walletId')
    @UseGuards(PermissionGuard([Permission.Wallets]))
    async deleteWallet(@Req() req: RequestWithUser, @Param('walletId') walletId: string): Promise<void> {
        const wallets = await this.walletsService.findAll({ where: { accountId: req.user.accountId } });

        if (!wallets.find((wallet) => wallet.id === walletId)) {
            throw new NotFoundException(`Wallet not found`);
        }

        return this.walletsService.delete(walletId);
    }

    @Get('reviews')
    async getReviews(@Req() req: RequestWithUser): Promise<OrderReview[]> {
        return this.reviewsService.getById(req.user.accountId);
    }
}
