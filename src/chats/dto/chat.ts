import { Chat as PrismaChat, Order, Product as PrismaProduct, Account as PrismaAccount } from '@prisma/client';
import { Type } from 'class-transformer';
import { Account } from '../../accounts/dto/account.dto';

interface FullPrismaChat extends PrismaChat {
    buyer: PrismaAccount;
    seller: PrismaAccount;
    product: PrismaProduct;
    order?: Order;
}

interface SendbirdChat {
    lastMessage: {
        message: string;
        createdAt: Date;
    }
    unreadMessageCount: number;
}

export class Chat implements PrismaChat {
    id: string;
    createdAt: Date;
    url: string;
    buyerId: string;
    sellerId: string;
    productId: string;
    offerId: string;

    lastMessage: {
        message: string,
        createdAt: Date,
    };

    unreadMessageCount: number;

    @Type(() => Account) buyer: Account;
    @Type(() => Account) seller: Account;

    constructor(partial: Partial<FullPrismaChat & SendbirdChat>) {
        Object.assign(this, partial);
    }
}
