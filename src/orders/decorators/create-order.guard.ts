import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { IdentityVerificationStatus } from '@prisma/client';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { UserService } from '../../user/user.service';
import { ProductsService } from '../../products/products.service';

@Injectable()
export class CreateOrderAuthorizationGuard implements CanActivate {
    constructor(
        private readonly userService: UserService,
        private readonly productsService: ProductsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const req = context.switchToHttp().getRequest() as RequestWithUser;

        const user = await this.userService.getById(req.user.id);

        if (!user) {
            return false;
        }

        const product = await this.productsService.getById(req.body.productId);

        if (!product.approved || !product.published) {
            return false;
        }

        if (user.idVerificationStatus === IdentityVerificationStatus.Full) {
            return true;
        }

        return false;
    }
}
