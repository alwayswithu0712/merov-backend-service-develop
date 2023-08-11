import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Patch,
    Req,
    UsePipes,
    Logger,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { UpdateUserDto } from './../dto/update-user.dto';
import { updatePasswordSchema } from './../schema/update-user-password.schema';
import { updateUserSchema } from '../schema/update-user.schema';
import { UserService } from './../user.service';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { Auth0Service } from '../../shared/services/auth0.service';
import { User } from './../dto/user.dto';
import { CreateDeviceDto } from '../dto/create-device.dto';
import { PermissionsSerializerInterceptor } from 'src/shared/interceptors/class-serializer.interceptors';

@Controller('users/me')
@ApiTags('Users')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(PermissionsSerializerInterceptor)
export class MyUserController {
    private readonly logger = new Logger(MyUserController.name);

    constructor(
        private readonly auth0Service: Auth0Service,
        private readonly userService: UserService,
    ) {}

    @Patch()
    @UsePipes(new JoiValidationPipe(updateUserSchema))
    async patch(@Req() req: RequestWithUser, @Body() body: UpdateUserDto): Promise<User> {
        return this.userService.update(req.user.id, body);
    }

    @Get()
    async get(@Req() req: RequestWithUser): Promise<User> {
        return this.userService.getById(req.user.id);
    }

    @Patch('change-password')
    async changePassword(@Req() req: RequestWithUser, @Body(new JoiValidationPipe(updatePasswordSchema)) body: { password: string }) {
        return this.auth0Service.changePassword(req.user.id, body.password);
    }

    @Patch('complete-profile')
    async completeProfile(@Req() req: RequestWithUser, @Body() body: UpdateUserDto) {
        await this.userService.update(req.user.id, body);
    }

    @Post('verification-email')
    async sendVerificationEmail(@Req() req: RequestWithUser) {
        return this.auth0Service.sendVerificationEmail(req.user.id);
    }

    @Post('device')
    async addDevice(@Req() req: RequestWithUser, @Body() body: CreateDeviceDto) {
        return this.userService.addDevice(req.user.id, body);
    }
}
