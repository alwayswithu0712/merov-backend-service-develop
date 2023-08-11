import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { ContactFormDto } from './dto/contact-form.dto';
import {ContactForm, Prisma} from '@prisma/client'
import { PaginatedResponse, toPaginatedResponse } from '../shared/typings/paginatedResponse';


@Injectable()
export class ContactFormService {
    constructor(private prisma: PrismaService) {}

    public async findAll(pagination: {
        where?: Prisma.ContactFormWhereInput;
        orderBy?: Prisma.ContactFormOrderByWithRelationAndSearchRelevanceInput;
        skip?: number;
        take?: number;
    }): Promise<PaginatedResponse<ContactForm>> {
        const count = await this.prisma.contactForm.count({
            where: pagination.where,
        });

        const contactForm = await this.prisma.contactForm.findMany(pagination)

        return toPaginatedResponse(contactForm, count, pagination.skip, pagination.take);
    }

    public async create(contact: ContactFormDto): Promise<ContactForm> {
        return this.prisma.contactForm.create({
            data:contact
        });
    }  
}