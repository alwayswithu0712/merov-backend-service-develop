import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Permission } from '../typings/permissions';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { hasPermission } from '../helpers/has-permissions';



const PermissionGuard = (permissions: Permission[]): Type<CanActivate> => {
    class PermissionGuardMixin extends AuthGuard('jwt') {
        async canActivate(context: ExecutionContext) {
            const parentCanActivate: boolean = (await super.canActivate(context)) as boolean;
            if (!parentCanActivate) {
                return false;
            }
            const request = context.switchToHttp().getRequest<RequestWithUser>();
            
            return hasPermission(request.user.permissions, permissions);
        }
    }

    return mixin(PermissionGuardMixin);
};

export default PermissionGuard;
