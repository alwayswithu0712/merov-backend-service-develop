import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Role } from './typings/role';
import { RequestWithUser } from './typings/requestWithUser';
import { AuthGuard } from '@nestjs/passport';

const RoleGuard = (role: Role): Type<CanActivate> => {
    class RoleGuardMixin extends AuthGuard('jwt') {
        async canActivate(context: ExecutionContext) {
            await super.canActivate(context);

            const request = context.switchToHttp().getRequest<RequestWithUser>();
            const user = request.user;

            return user?.roles.includes(role);
        }
    }

    return mixin(RoleGuardMixin);
};

export default RoleGuard;
