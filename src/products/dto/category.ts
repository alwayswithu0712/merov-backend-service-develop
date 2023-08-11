import { Subcategory as PrismaSubcategory, Category as PrismaCategory, Prisma } from "@prisma/client";
import { Exclude, Type } from "class-transformer";

interface FullPrismaCategory extends PrismaCategory {
    subcategories: PrismaSubcategory[];
}

export class Category implements PrismaCategory {
    id: string;
    name: string;
    
    fields: Prisma.JsonValue;

    @Type(() => Subcategory) subcategories: Subcategory[];
    @Exclude() createdAt: Date;
    @Exclude() wallapopId: number;

    constructor(partial: Partial<FullPrismaCategory>) {
        Object.assign(this, partial);
    }
}

export class Subcategory implements PrismaSubcategory {
    id: string;
    name: string;
    categoryId: string;
    fields: Prisma.JsonValue;

    @Exclude() wallapopId: number;
    @Exclude() createdAt: Date;

    constructor(partial: Partial<Subcategory>) {
        Object.assign(this, partial);
    }
}