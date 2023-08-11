import { Prisma } from '@prisma/client';
import { Permission } from '../../shared/typings';
export type CreateInviteDto = Prisma.InvitationCreateInput;
export type CreateInviteRelaxedDto = Prisma.InvitationUncheckedCreateInput;
export type CreateManyInviteDto = Prisma.InvitationCreateManyInput;


export class CreateInviteListItemDto {
    email: string;
    permissions?: Permission[];
}

export class CreateInviteListDto {
    invites: CreateInviteListItemDto[]
}
