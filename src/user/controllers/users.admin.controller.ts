import { Controller, Get, Body, Param, UseGuards, Patch, Logger, NotFoundException, SerializeOptions } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './../dto/update-user.dto';
import { UserService } from './../user.service';
import RoleGuard from '../../auth/role.guard';
import { Role } from '../../auth/typings/role';
import { GetPagination } from '../../shared/decorators/pagination.decorator';
import { Pagination } from '../../shared/typings/pagination';
import { PaginatedResponse } from '../../shared/typings/paginatedResponse';
import { Auth0Service } from '../../shared/services/auth0.service';
import { User } from './../dto/user.dto';
import { MEROV_ADMIN } from '../../shared/typings/groups';

@Controller('admin/users')
@ApiTags('Users')
@UseGuards(AuthGuard('jwt'))
@UseGuards(RoleGuard(Role.MerovAdmin))
@SerializeOptions({ groups: [MEROV_ADMIN] })
export class AdminUserController {
    private readonly logger = new Logger(AdminUserController.name);

    constructor(private readonly userService: UserService, private readonly auth0Service: Auth0Service) {}

    @Get()
    async get(@GetPagination() pagination: Pagination): Promise<PaginatedResponse<User>> {
        return this.userService.findAll(pagination);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<User> {
        return this.userService.getById(id);
    }

    @Patch(':id')
    async patch(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<User> {
        const user = await this.userService.getById(id);

        if (!user) {
            throw new NotFoundException();
        }

        if (typeof body.blocked === 'boolean') {
            await this.auth0Service.patch(user.authId, { blocked: body.blocked });
        }

        return this.userService.update(id, body);
    }
}
