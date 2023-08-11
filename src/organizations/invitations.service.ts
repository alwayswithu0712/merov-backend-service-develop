import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, InvitationStatus } from '@prisma/client';
import { PrismaService } from '../shared/services/prisma.service';
import { PaginatedResponse, toPaginatedResponse } from '../shared/typings/paginatedResponse';
import { Invitation } from './dto/invitation.dto';
import { CreateInviteDto, CreateInviteRelaxedDto } from './dto/create-invite.dto';
import { UpdateInvitationDto } from './dto/update-invite.dto';
import { DEFAULT_PERMISSIONS } from '../shared/typings/permissions';

@Injectable()
export class InvitationsService {
    constructor(
        private prisma: PrismaService,
    ) {}
    private readonly logger = new Logger(InvitationsService.name);

    async create(data: CreateInviteDto): Promise<Invitation> {

        const invite = await this.prisma.invitation.create({
            data,
            include: {
                account: true,
                sender: true
            }
        })

        return new Invitation(invite)

    }

    async createMany(data: CreateInviteRelaxedDto[]): Promise<Invitation[]> {
        let results = await this.prisma.$transaction(

            data.map((invite) => {

                invite.permissions = invite.permissions ?? DEFAULT_PERMISSIONS;

                return this.prisma.invitation.create({
                    data: invite,
                    include: {
                        account: true,
                        sender: true
                    }
                })

            })

        );
        return results.map(i => new Invitation(i));
    }

    async findAll(params: {
        where?: Prisma.InvitationWhereInput;
        orderBy?: Prisma.InvitationOrderByWithRelationAndSearchRelevanceInput;
        skip?: number;
        take?: number;
    }): Promise<PaginatedResponse<Invitation>> {

        const count = await this.prisma.invitation.count({
            where: params.where,
        })

        const invitations = await this.prisma.invitation.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            ...params,
        });

        return toPaginatedResponse(
            invitations.map((invitation) => new Invitation(invitation)),
            count,
            params.skip,
            params.take,
        );

    }

    async findUnique(id: string): Promise<Invitation> {
        let invite = await this.prisma.invitation.findUnique({
            where: { id }
        })
        return new Invitation(invite)
    }

    async update(id: string, data: UpdateInvitationDto): Promise<Invitation> {
        const invitation = await this.prisma.invitation.update({
            where: {
                id,
            },
            data,
        })
        return new Invitation(invitation)
    }

    async confirmInvitation(id: string, email: string): Promise<Invitation> {

        let invitation = await this.findUnique(id);

        if (!invitation) {
            this.logger.error(`No invitation with id ${id} for email ${email}`)
            return;
        }

        if (invitation.email !== email) {
            this.logger.error(`No invitation with id ${id} for email ${email}`);
            throw new Error(`No invitation with id ${id} for email ${email}`);
        }

        if (invitation.status === InvitationStatus.Expired) {
            this.logger.warn(`Invitation with id ${id} and email ${email} has expired.`);
            return;
        } 
        else if (invitation.status === InvitationStatus.Confirmed) {
            this.logger.warn(`Invitation with id ${id} and email ${email} has already been confirmed.`);
            return;
        }

        const invite = await this.prisma.invitation.update({
            where: {
                id
            },
            data: {
                status: InvitationStatus.Confirmed,
            },
        })
        return new Invitation(invite)

    }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handleCron() {
        const invitations = await this.prisma.invitation.findMany({ where: { status: InvitationStatus.Pending }});
        for (const invitation of invitations) {
            if (new Date() > new Date(invitation.dueDate)) {
                await this.update(invitation.id, { status: InvitationStatus.Expired });
            }
        }
    }

}
