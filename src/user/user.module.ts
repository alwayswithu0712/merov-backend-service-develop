import { Module } from '@nestjs/common';

import { SendBirdService } from '../shared/services/sendbird.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../shared/services/prisma.service';
import { UserController } from './controllers/users.controller';
import { UserService } from './user.service';
import { Auth0Service } from '../shared/services/auth0.service';
import { AdminUserController } from './controllers/users.admin.controller';
import { MyUserController } from './controllers/users.me.controller';
import { AccountsService } from '../accounts/accounts.service';
import { OrganizationsService } from '../organizations/organizations.service';

@Module({
    imports: [AuthModule],
    controllers: [MyUserController, AdminUserController, UserController],
    providers: [
        UserService,
        PrismaService,
        SendBirdService,
        Auth0Service,
        AccountsService,
        OrganizationsService,
    ],
    exports: [UserService, Auth0Service],
})
export class UsersModule {}
