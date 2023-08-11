import { CACHE_MANAGER, Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { castPermission } from '../shared/helpers/permission';
import { Permission } from '../shared/typings';
import { Auth0Service } from '../shared/services/auth0.service';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { PrismaService } from '../shared/services/prisma.service';
import { User } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import * as set  from '../shared/helpers/set';

@Injectable()
export class MembersService {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
        private readonly auth0Service: Auth0Service,
        @Inject(CACHE_MANAGER) private cache: Cache,
    ) {}
    private readonly logger = new Logger(MembersService.name);

    async cacheSavePerm(authId: string, permissions: Permission[]) {
        const cacheKey = `permissions/${authId}`;
        await this.cache.set(cacheKey, JSON.stringify(permissions), { ttl: 60 * 2 /* 2 minutes */});
    }

    async cacheLoadPerm(authId: string): Promise<Permission[]> {
        const cacheKey = `permissions/${authId}`;
        const stringifiedPerms: string | null = await this.cache.get(cacheKey);
        if (stringifiedPerms) {
            let perms: string[] = JSON.parse(stringifiedPerms);
            return perms.map(castPermission).filter(x => x);
        }
    }

    async getPermissions(authId: string, { skipCache = false }: { skipCache?: boolean } = {}): Promise<Permission[]> {
        if (skipCache) this.logger.log("Overriding cache");
        let permissions: Permission[] = skipCache ? null : await this.cacheLoadPerm(authId);
        if (!permissions) {
            permissions = await this.auth0Service.getPermissions(authId);
            if (!permissions) {
                throw new ServiceUnavailableException("Auth0 is having trouble answering out requests.")
            }
            await this.cacheSavePerm(authId, permissions)
        }
        return permissions;
    }

    async addPermissions(member: User, permissions: string[]): Promise<User> {
        await this.auth0Service.addPermissions(member.authId, permissions);
        member.permissions = [...member.permissions, ...permissions] as Permission[];
        await this.cacheSavePerm(member.authId, member.permissions);
        return member;
    }

    async removePermissions(member: User, permissions: string[]): Promise<User> {
        await this.auth0Service.removePermissions(member.authId, permissions);
        member.permissions = member.permissions.filter(p => permissions.indexOf(p) < 0);
        await this.cacheSavePerm(member.authId, member.permissions);
        return member;
    }

    async editPermissions(member: User, permissions: string[]): Promise<User> {
        let newPerms = new Set(permissions);
        let currentPerms = new Set(member.permissions);
        let toAddPerms = set.difference(newPerms, currentPerms);
        let toRemovePerms = set.difference(currentPerms, newPerms);
        if (toAddPerms.size > 0) {
            await this.auth0Service.addPermissions(member.authId, [...toAddPerms]);
        }
        if (toRemovePerms.size > 0) {
            await this.auth0Service.removePermissions(member.authId, [...toRemovePerms]);
        }
        member.permissions = [...newPerms].map(castPermission).filter(x => x);
        await this.cacheSavePerm(member.authId, member.permissions);
        return member;
    }

    async getByAccountId(id: string): Promise<User[]> {
        const account = await this.prisma.account.findUnique({
            where: {
                id,
            },
            include: {
                users: true,
            },
        });

        if (!account) {
            throw new NotFoundException(`Account with id ${id} not found`);
        }

        const members = account.users.filter(user => !user.blocked).map((u) => new User(u));

        return members;
    }

    async getByMemberId(memberId: string, { skipCache = false }: { skipCache?: boolean } = {}): Promise<User> {

        const member = await this.prisma.user.findUnique({
            where: { id: memberId }
        });

        if (!member) {
            throw new NotFoundException(`Member with id ${memberId} not found`);
        }

        let user = new User(member);
        user.permissions = await this.getPermissions(member.authId, {skipCache});

        return user;

    }

    async getByAccountIdMemberId(id: string, memberId: string): Promise<User> {
        const account = await this.prisma.account.findUnique({
            where: {
                id,
            },
            include: {
                users: true,
            },
        });

        if (!account) {
            throw new NotFoundException(`Account with id ${id} not found`);
        }

        const member = account.users.find((user) => user.id === memberId);

        if (!member) {
            throw new NotFoundException(`Member with id ${memberId} not found`);
        }

        let user = new User(member);
        user.permissions = await this.getPermissions(member.authId);

        return user;
    }

    //TODO: change data for permissions to not change anything else
    async update(accountId: string, memberId: string, data: UpdateUserDto): Promise<User> {
        const account = await this.prisma.account.findUnique({
            where: {
                id: accountId,
            },
            include: {
                users: true,
            },
        });

        if (!account) {
            throw new NotFoundException(`Account with id ${accountId} not found`);
        }

        return this.userService.update(memberId, data);
    }
}
