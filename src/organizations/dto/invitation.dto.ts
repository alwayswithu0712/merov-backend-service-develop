import { Account } from '../../accounts/dto/account.dto';
import { User } from '../../user/dto/user.dto';
import { MEROV_ADMIN } from '../../shared/typings/groups';
import { Type, Expose } from 'class-transformer';
import { Permission } from '../../shared/typings/permissions';
import { Invitation as PrismaInvitation, Account as PrismaAccount, User as PrismaUser, InvitationStatus } from '@prisma/client';

interface FullPrismaInvitation extends PrismaInvitation {
    account: PrismaAccount;
    sender: PrismaUser;
}

export class Invitation implements PrismaInvitation {
    id: string;
    email: string;
    accountId: string;
    status: InvitationStatus
    dueDate: Date
    senderId: string
    permissions: Permission[];

    @Expose({ groups: [MEROV_ADMIN] }) createdAt:   Date;
    @Expose({ groups: [MEROV_ADMIN] }) updatedAt:   Date;

    @Expose({ groups: [MEROV_ADMIN] }) @Type(() => Account) account: Account;
    @Expose({ groups: [MEROV_ADMIN] }) @Type(() => User) sender: User;

    constructor(partial: Partial<FullPrismaInvitation>) {
        Object.assign(this, partial);
    }

}
