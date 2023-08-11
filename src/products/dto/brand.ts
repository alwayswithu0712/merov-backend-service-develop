import { Brand as PrismaBrand } from "@prisma/client";
import { Expose } from "class-transformer";
import { MEROV_ADMIN } from "../../shared/typings/groups";

export class Brand implements PrismaBrand {
    id: string;
    categoryId: string;
    subcategoryId: string;
    name: string;
    @Expose({ groups: [MEROV_ADMIN] }) approved: boolean;

    constructor(partial: Partial<Brand>) {
        Object.assign(this, partial);
    }
}