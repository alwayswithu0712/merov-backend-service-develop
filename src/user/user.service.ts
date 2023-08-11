import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Device, Prisma, Account } from '@prisma/client';
import { PaginatedResponse, toPaginatedResponse } from '../shared/typings/paginatedResponse';
import { PrismaService } from '../shared/services/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './dto/user.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { AccountsService } from '../accounts/accounts.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { Auth0Service } from '../shared/services/auth0.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Permission } from '../shared/typings';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly organizationsService: OrganizationsService,
        private readonly accountsService: AccountsService,
        private readonly auth0Service: Auth0Service,
        private readonly eventEmitter: EventEmitter2,
    ) {}
    private readonly logger = new Logger(UserService.name);

    async create(data: CreateUserDto): Promise<User> {
        const isCreatingFromInvitation = !!data.invitation;
        let account: Account;

        if (!isCreatingFromInvitation) {
            let accountData = {
                id: data.accountId,
                name: data.name,
                email: data.email,
            };

            if (data.referral) {
                const referral = await this.accountsService.getByName(data.referral as string);
                if (!!referral) {
                    accountData['referredBy'] = {
                        connect: {
                            id: referral.id,
                        },
                    };
                }
            }
            account = await this.accountsService.create(accountData);
        }

        const user = await this.prisma.user.create({
            data: {
                id: data.userId,
                authId: data.authId,
                email: data.email,
                account: {
                    connect: {
                        id: data.accountId,
                    },
                },
            },
        });

        await this.auth0Service.patch(data.authId, {
            app_metadata: {
                accountId: user.accountId,
                userId: user.id,
            },
        });

        if (!isCreatingFromInvitation) {
            await this.auth0Service.addPermissions(data.authId, [Permission.Owner]);
        }

        if (data.organization) {
            const organization = await this.organizationsService.create({
                ...data.organization,
                account: {
                    connect: {
                        id: isCreatingFromInvitation ? data.accountId : account.id,
                    },
                },
            });

            const emitted = this.eventEmitter.emit('organization.created', { organization });

            // todo: remove after testing flow
            if (!emitted) {
                this.logger.error('Could not emit organization.created event');
                throw new Error('Could not emit organization.created event');
            }
        }
        return new User(user);
    }

    async update(id: string, data: UpdateUserDto): Promise<User> {
        const user = await this.prisma.user.update({
            where: {
                id,
            },
            data,
        });

        return new User(user);
    }

    async getById(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                account: {
                    include: {
                        organization: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        return new User(user);
    }

    public async findAll(params: {
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationAndSearchRelevanceInput;
        skip?: number;
        take?: number;
    }): Promise<PaginatedResponse<User>> {
        const count = await this.prisma.user.count({
            where: params.where,
        });
        const users = await this.prisma.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            ...params,
        });

        return toPaginatedResponse(
            users.map((user) => new User(user)),
            count,
            params.skip,
            params.take,
        );
    }

    // todo: move to product service
    async getProductsForSeller(id: string) {
        return this.prisma.product.findMany({
            where: {
                sellerId: id,
            },
            include: { category: true, subcategory: true, seller: true, orders: true },
        });
    }

    async addDevice(userId: string, data: CreateDeviceDto) {
        const device = await this.prisma.device.findUnique({
            where: { firebaseToken: data.firebaseToken },
        });
        if (device) {
            return await this.prisma.device.update({
                where: {
                    id: device.id,
                },
                data: {
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
        }
        return this.prisma.device.create({
            data: {
                ...data,
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }

    async getUserDevices(userId: string): Promise<Device[]> {
        const devices = await this.prisma.device.findMany({
            where: {
                userId,
            },
        });
        return devices;
    }
}
