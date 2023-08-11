import { Body, Controller, Get, Post, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../shared/pipes/validation.pipe';
import RoleGuard from '../auth/role.guard';
import { Role } from '../auth/typings/role';
import { SubscriptionEmailService } from './subscription-email.service';
import { createSubscriptionEmailSchema } from './schema/create-subscription-email.schema';
import {SubscriptionEmail} from '@prisma/client'

@Controller('emails')
@ApiTags('Emails')
export class SubscriptionEmailController {
    constructor(private readonly subscriptionEmailService: SubscriptionEmailService) {}

    @Get()
    @UseGuards(RoleGuard(Role.MerovAdmin))
    async get(): Promise<SubscriptionEmail[]> {
        return this.subscriptionEmailService.findAll();
    }

    @Post()
    @UsePipes(new JoiValidationPipe(createSubscriptionEmailSchema))
    async create(@Body() subscriptionEmail:SubscriptionEmail): Promise<SubscriptionEmail> {
        return this.subscriptionEmailService.create(subscriptionEmail);
    }
}