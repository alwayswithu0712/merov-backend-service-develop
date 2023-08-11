import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import {SubscriptionEmail} from '@prisma/client'

@Injectable()
export class SubscriptionEmailService {
    constructor(private prisma: PrismaService) {}

    public async findAll(): Promise<SubscriptionEmail[]> {
        return this.prisma.subscriptionEmail.findMany({
        })
    }

    public async create(data: SubscriptionEmail): Promise<SubscriptionEmail> {
        return  this.prisma.subscriptionEmail.create({
           data
       });
   }  
}