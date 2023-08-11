import {
    Account as PrismaAccount,
    User as PrismaUser,
    Organization as PrismaOrganization,
    Order,
    OrderStatus,
    Product,
} from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { User } from '../../user/dto/user.dto';
import { Organization } from '../../organizations/dto/organization.dto';
import { MEROV_ADMIN } from 'src/shared/typings/groups';
import { Permission } from 'src/shared/typings';

export interface FullPrismaAccount extends PrismaAccount {
    products: Product[];
    sellOrders: Order[];
    users: PrismaUser[];
    organization?: PrismaOrganization;
}

export class Account implements PrismaAccount {
    id: string;
    createdAt: Date;
    name: string;
    email: string;
    avatarUrl: string;
    reviewCount: number;
    rating: number;
    productsCount: number;
    itemsSoldCount: number;

    @Expose({ groups: [Permission.Owner, Permission.Admin, Permission.Chats] })
    sendBirdAccessToken: string;

    @Expose({ groups: [MEROV_ADMIN, Permission.Owner, Permission.Admin] })
    referralId: string;

    @Expose({ groups: [MEROV_ADMIN, Permission.Owner, Permission.Admin] })
    @Type(() => User)
    users: User[];

    @Type(() => Organization) 
    organization?: Organization;

    @Expose({ groups: [MEROV_ADMIN] })
    count: number;

    @Exclude()
    sellOrders: Order[];

    @Exclude()
    products: Product[];

    constructor(partial: Partial<FullPrismaAccount>) {
        Object.assign(this, partial);

        this.productsCount = partial.products?.length || 0;
        this.itemsSoldCount =
            partial.sellOrders?.filter((order) => order.status === OrderStatus.Completed).reduce((acc, order) => acc + order.quantity, 0) ||
            0;
    }
}
