import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { OrganizationsService } from '../organizations.service';
import { AccountsService } from '../../accounts/accounts.service';

@Injectable()
export class HasOrganizationGuard implements CanActivate {
    constructor(
        private readonly organizationsService: OrganizationsService,
        private readonly accountsService: AccountsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest() as RequestWithUser;

        let organization;
        if (req.params.organizationId) {
            organization = await this.organizationsService.getById(req.params.organizationId);
        }
        else {
            organization = await this.organizationsService.findOne({
                where: {
                    accountId: req.user.accountId
                }
            });
        }

        if (!organization) {
            return false;
        }

        return true;
    }
}
