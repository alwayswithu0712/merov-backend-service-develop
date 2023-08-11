import { Module } from '@nestjs/common';
import { ContactFormService } from './contact-form.service';
import { ContactFormController } from './contact-form.controller';
import { PrismaService } from '../shared/services/prisma.service';

@Module({
    imports: [],
    controllers: [ContactFormController],
    providers: [ ContactFormService, PrismaService],
    exports: [ContactFormService],
})
export class ContactFormModule {}