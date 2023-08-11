import {
    Controller,
    Logger,
    ClassSerializerInterceptor,
    UseInterceptors,
    Req,
    UsePipes,
    Body,
    Post,
    Get,
    Query,
    Param,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from '../organizations.service';
import { InvitationsService } from '../invitations.service';
import { Invitation } from '../dto/invitation.dto';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { Organization } from '../dto/organization.dto';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { createOrganizationSchema } from '../schema/create-organization.schema';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('organizations')
@ApiTags('Organizations')
@UseInterceptors(ClassSerializerInterceptor)
export class OrganizationsController {
    private readonly logger = new Logger(OrganizationsController.name);

    constructor(
        private readonly organizationsService: OrganizationsService,
        private readonly invitationsService: InvitationsService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new JoiValidationPipe(createOrganizationSchema))
    async createOrganization(@Req() req: RequestWithUser, @Body() createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
        const organization = await this.organizationsService.create({
            ...createOrganizationDto,
            account: {
                connect: {
                    id: req.user.accountId,
                },
            },
        });

        const emitted = this.eventEmitter.emit('organization.created', { organization });

        // todo: remove after testing flow
        if (!emitted) {
            this.logger.error('Could not emit organization.created event');
            throw new Error('Could not emit organization.created event');
        }

        return organization;
    }

    @Get('invitations/:invitationId/confirm')
    async confirmInvitation(
        @Param('invitationId') invitationId: string,
        @Query('email') email: string,
    ): Promise<Invitation> {
        return this.invitationsService.confirmInvitation(invitationId, email);
    }

}
