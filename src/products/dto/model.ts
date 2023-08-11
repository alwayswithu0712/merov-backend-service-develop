import { Model as PrismaModel } from '@prisma/client';
import { Expose } from 'class-transformer';
import { MEROV_ADMIN } from '../../shared/typings/groups';

export class Model implements PrismaModel {
    id: string;
    categoryId: string;
    subcategoryId: string;
    brand: string;
    name: string;
    @Expose({ groups: [MEROV_ADMIN] }) approved: boolean;

    constructor(partial: Partial<Model>) {
        Object.assign(this, partial);
    }
}