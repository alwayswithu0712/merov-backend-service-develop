import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './typings/requestWithUser';
import { Role } from "./typings/role";


const NAMESPACE = 'https://merov.io';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private logger = new Logger('JwtStrategy');

    constructor(
        readonly configService: ConfigService,
    ) {
        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${configService.get('auth0').issuerBaseUrl}.well-known/jwks.json`,
            }),

            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience: configService.get('auth0').merovAudience,
            issuer: configService.get('auth0').issuerBaseUrl,
        });
    }

    validate(payload: TokenPayload, done: VerifiedCallback) {
        if (!payload) {
            done(new UnauthorizedException(), false);
        }

        const verified = {
            id: payload[`${NAMESPACE}/userId`],
            accountId: payload[`${NAMESPACE}/accountId`],
            email: payload[`${NAMESPACE}/email`],
            permissions: payload.permissions,
            sessionId: payload.sessionId,
            isAdmin: this.isAdmin(payload),
            auth0Id: payload.sub,
            username: payload[`${NAMESPACE}/username`],
            roles: payload[`${NAMESPACE}/roles`],
        }

        return done(null, verified);
    }

    isAdmin(payload: TokenPayload): boolean {
        return payload['https://merov.io/roles'].indexOf(Role.MerovAdmin) > -1;
    }
}
