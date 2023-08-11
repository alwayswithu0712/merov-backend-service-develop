import { Body, Controller, Get, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../shared/pipes/validation.pipe';
import RoleGuard from '../auth/role.guard';
import { Role } from '../auth/typings/role';
import { ContactFormService } from './contact-form.service';
import { ContactFormDto } from './dto/contact-form.dto';
import { createContactFormSchema } from './schema/contact-form.schema';
import { ContactForm } from '@prisma/client';
import { GetProductPagination } from '../products/decorators/products.pagination.decorator';
import { Pagination } from '../shared/typings/pagination';
import { PaginatedResponse } from '../shared/typings/paginatedResponse';

@Controller('contact')
@ApiTags('Contact')
export class ContactFormController {
    constructor(private readonly contactFormService: ContactFormService) {}

    @Get()
    @UseGuards(RoleGuard(Role.MerovAdmin))
    async get(@GetProductPagination() pagination: Pagination): Promise<PaginatedResponse<ContactForm>> {
        return this.contactFormService.findAll(pagination);
    }

    @Post()
    @UsePipes(new JoiValidationPipe(createContactFormSchema))
    async create(@Body() contact: ContactFormDto): Promise<ContactForm> {
        return this.contactFormService.create(contact);
    }
}
