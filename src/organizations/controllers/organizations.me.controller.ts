import { Controller,
    Get,
    Delete,
    Logger,
    Req,
    Patch,
    UsePipes,
    Body,
    UseGuards,
    UseInterceptors,
    Param,
    Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrganizationsService } from '../organizations.service';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { Organization } from '../dto/organization.dto';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { updateOrganizationSchema } from '../schema/update-organization.schema';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { PermissionsSerializerInterceptor } from '../../shared/interceptors/class-serializer.interceptors';
import { MembersService } from '../members.service';
import { InvitationsService } from '../invitations.service';
import { Auth0Service } from '../../shared/services/auth0.service';
import { EmailTemplate } from '../../shared/typings/auth0.dto';
import PermissionGuard from '../../shared/pipes/permissions.guard';
import { HasOrganizationGuard } from '../decorator/has-organization.guard';
import { User } from '../../user/dto/user.dto';
import { inviteListSchema } from '../schema/invite-list.schema';
import { CreateInviteListDto, CreateInviteListItemDto } from '../dto/create-invite.dto';
import { Invitation } from '../dto/invitation.dto';
import { PermissionsDto } from '../dto/permissions.dto';
import { PaginatedResponse } from '../../shared/typings/paginatedResponse';
import { AssertPermissions } from '../../shared/helpers/permission';
import { UserService } from '../../user/user.service';


@Controller('organizations/me')
@ApiTags('Organizations')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(PermissionsSerializerInterceptor)
export class MyOrganizationsController {
    private readonly logger = new Logger(MyOrganizationsController.name);

    constructor(
        private readonly organizationsService: OrganizationsService,
        private readonly membersService: MembersService,
        private readonly invitationsService: InvitationsService,
        private readonly auth0Service: Auth0Service,
        private readonly userService: UserService
    ) {}
    @Get()
    async get(@Req() req: RequestWithUser): Promise<Organization> {
        const params = {
            where: {
                accountId: req.user.accountId,
            },
        };

        return this.organizationsService.findOne(params);
    }

    //TODO: check if the users is logged and have the permissions to update
    @Patch()
    @UsePipes(new JoiValidationPipe(updateOrganizationSchema))
    async patch(@Req() req: RequestWithUser, @Body() body: UpdateOrganizationDto): Promise<Organization> {
        const organization = await this.organizationsService.update(req.user.id, body);
        return organization;
    }

    @Get('members')
    @UseGuards(PermissionGuard([]))
    @UseGuards(HasOrganizationGuard)
    async getMembers(@Req() req: RequestWithUser): Promise<User[]> {
        return this.membersService.getByAccountId(req.user.accountId);
    }

    @Get('members/:memberId')
    @UseGuards(PermissionGuard([]))
    @UseGuards(HasOrganizationGuard)
    async getMember(@Req() req: RequestWithUser, @Param('memberId') memberId: string): Promise<User> {
        return this.membersService.getByAccountIdMemberId(req.user.accountId, memberId);
    }

    @Delete('members/:memberId')
    @UseGuards(PermissionGuard([]))
    @UseGuards(HasOrganizationGuard)
    async blockMember(@Req() req: RequestWithUser, @Param('memberId') memberId: string): Promise<User> {
        let member = await this.membersService.getByMemberId(memberId, {skipCache: true});
        AssertPermissions(req.user.permissions, member.permissions);
        await this.auth0Service.patch(member.authId, { blocked: true });
        return this.userService.update(memberId, { blocked: true });
    }

    @Post('members/:memberId/permissions')
    @UseGuards(PermissionGuard([]))
    @UseGuards(HasOrganizationGuard)
    async memberAddPermissions(
        @Req() req: RequestWithUser,
        @Param('memberId') memberId: string,
        @Body() permissionsDto: PermissionsDto,
    ): Promise<User> {
        const member = await this.membersService.getByMemberId(memberId, {skipCache: true});
        AssertPermissions(req.user.permissions, member.permissions, [...member.permissions, ...permissionsDto.permissions]);
        return this.membersService.addPermissions(member, permissionsDto.permissions);
    }

    @Delete('members/:memberId/permissions')
    @UseGuards(PermissionGuard([]))
    @UseGuards(HasOrganizationGuard)
    async memberRemovePermissions(
        @Req() req: RequestWithUser,
        @Param('memberId') memberId: string,
        @Body() permissionsDto: PermissionsDto,
    ): Promise<User> {
        const member = await this.membersService.getByMemberId(memberId, {skipCache: true});
        const newPerms = member.permissions.filter(p => permissionsDto.permissions.indexOf(p) < 0);
        AssertPermissions(req.user.permissions, member.permissions, newPerms);
        return this.membersService.removePermissions(member, permissionsDto.permissions);
    }

    @Patch('members/:memberId/permissions')
    @UseGuards(PermissionGuard([]))
    @UseGuards(HasOrganizationGuard)
    async memberEditPermissions(
        @Req() req: RequestWithUser,
        @Param('memberId') memberId: string,
        @Body() permissionsDto: PermissionsDto,
    ): Promise<User> {
        const member = await this.membersService.getByMemberId(memberId, {skipCache: true});
        AssertPermissions(req.user.permissions, member.permissions, permissionsDto.permissions);
        return this.membersService.editPermissions(member, permissionsDto.permissions);
    }

    @Post('invitations')
    @UsePipes(new JoiValidationPipe(inviteListSchema))
    @UseGuards(HasOrganizationGuard)
    async inviteMembers(@Req() req: RequestWithUser, @Body() invitesDto: CreateInviteListDto): Promise<Invitation[]> {
        const organization = await this.organizationsService.findOne({
            where: {
                accountId: req.user.accountId,
            },
        });

        const inviteEmailTemplate = await this.auth0Service.getEmailTemplate(EmailTemplate.ResetEmail);
        const urlLifetime = inviteEmailTemplate?.urlLifetimeInSeconds?? 5 * 24 * 60 * 60;
        const createInvitations = invitesDto.invites.map((i: CreateInviteListItemDto) => {
            const invite = {
                ...i,
                dueDate: new Date(Number(new Date()) + urlLifetime * 1000),
                senderId: req.user.id,
                accountId: req.user.accountId,
            };
            return invite;
        });

        const invitations = await this.invitationsService.createMany(createInvitations);

        const sendInvitations = invitations.map((invite) => {
            this.auth0Service.inviteMember(
                invite.email,
                req.user.email,
                organization.name,
                invite.accountId,
                invite.id,
                invite.permissions
            );
        });

        await Promise.all(sendInvitations);

        return invitations;
    }

    @Get('invitations')
    @UseGuards(HasOrganizationGuard)
    async getInvitations(@Req() req: RequestWithUser): Promise<PaginatedResponse<Invitation>> {
        return this.invitationsService.findAll({
            where: {
                accountId: req.user.accountId,
            },
        });
    }

    //TODO: GET -> /organizations/invitations/:invitationId

}
