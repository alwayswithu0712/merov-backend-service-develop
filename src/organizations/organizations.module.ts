import { Module } from '@nestjs/common';
import { SendBirdService } from '../shared/services/sendbird.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../shared/services/prisma.service';
import { OrganizationsController } from './controllers/organizations.controller';
import { AdminOrganizationsController } from './controllers/organizations.admin.controller';
import { OrganizationsService } from './organizations.service';
import { MembersService } from './members.service';
import { UsersModule } from '../user/user.module';
import { MyOrganizationsController } from './controllers/organizations.me.controller';
import { AccountsService } from '../accounts/accounts.service';
import { InvitationsService } from './invitations.service';
import { Auth0Service } from '../shared/services/auth0.service';

@Module({
    imports: [AuthModule, UsersModule],
    controllers: [OrganizationsController, AdminOrganizationsController, MyOrganizationsController],
    providers: [OrganizationsService, MembersService, PrismaService, SendBirdService, AccountsService, InvitationsService, Auth0Service],
    exports: [OrganizationsService, MembersService],
})
export class OrganizationsModule {}
