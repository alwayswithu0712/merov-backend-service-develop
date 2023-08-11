import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { IdentityVerificationStatus } from '@prisma/client';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { UserService } from '../../user/user.service';

@Injectable()
export class VerificationGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest() as RequestWithUser;

        const user = await this.userService.getById(req.user.id);

        if (!user) {
            return false;
        }

        if (user.idVerificationStatus === IdentityVerificationStatus.Full) {
            return true;
        }

        return false;
    }
}
