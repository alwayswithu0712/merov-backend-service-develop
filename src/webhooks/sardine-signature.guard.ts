import { CanActivate, ExecutionContext, Inject, Logger, mixin } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { Request } from 'express';
import { SardineConfig } from 'src/config/config.interface';

export const SardineSignatureGuard = () => {
    class SardineSignatureGuardMixin implements CanActivate {
        constructor(@Inject(ConfigService) readonly configService: ConfigService) {}

        logger = new Logger(SardineSignatureGuardMixin.name);

        canActivate(context: ExecutionContext): boolean {
            const signingSecret = this.configService.get<SardineConfig>('sardine').signingSecret;
            const request = context.switchToHttp().getRequest<Request>();
            const requestSignature = request.header('X-Sardine-Signature');
            const expectedSignature = createHmac('sha256', signingSecret).update(JSON.stringify(request.body)).digest('hex');

            // compare the computed HMAC against the request signature
            return expectedSignature == requestSignature;
        }
    }

    return mixin(SardineSignatureGuardMixin);
};
