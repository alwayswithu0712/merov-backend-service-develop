import { Controller, UseGuards, Post, Get, Query, Req, CACHE_MANAGER, Inject, NotFoundException, Body, Param, BadRequestException, Response as Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../../user/user.service';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { ProveService } from '../../prove/prove.service';
import { isUsPhone } from '../helpers/phone';
import { PhoneOtpService } from '../otp.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SardineService } from '../../sardine/sardine.service';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../shared/services/prisma.service';
import { IdentityVerificationStatus } from '@prisma/client';
import { IdentityVerificationsService } from '../identity-verifications.service';
import { ConfigService } from '@nestjs/config';
import { MerovConfig } from '../../config/config.interface';
import { ServerEventsService } from '../../server-events/server-events.service';
import { SardineVerificationUrlResponse } from '../../sardine/dto/responses';
import { ProveEvents } from '../events';

const PROVE_FINISH_EVENT = 'verifications.phone.finish';

@Controller('identity/verifications')
@ApiTags('Verifications')
export class VerificationsController {

    private readonly logger = new Logger(VerificationsController.name);

    constructor(
        @Inject(CACHE_MANAGER) private cache: Cache,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly proveService: ProveService,
        private readonly otpService: PhoneOtpService,
        private readonly sardineService: SardineService,
        private readonly prismaService: PrismaService,
        private readonly identityService: IdentityVerificationsService,
        private readonly serverEventsService: ServerEventsService,
        private eventEmitter: EventEmitter2
    ) {

    }

    @Post('otp/finish')
    @UseGuards(AuthGuard('jwt'))
    async otpFinish(@Body('otp') otp: string, @Req() req: RequestWithUser) {
        const user = await this.userService.getById(req.user.id);

        const isPhoneVerified = await this.otpService.verify(user.phone, otp);

        await this.prismaService.phoneVerification.create({
            data: {
                userId: user.id,
                phone: user.phone,
                provider: 'otp',
                verified: isPhoneVerified,
            }
        })

        if (isPhoneVerified) {
            await this.userService.update(user.id, { isPhoneVerified });

            try {
                await this.sardineService.checkReputation(req.user.sessionId, { 
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    dateOfBirth: user.dateOfBirth,
                    emailAddress: user.email
                });
            } catch (error) {
                this.logger.warn(error);
            }
        }

        return { isPhoneVerified };
    }


    @Post('start')
    @UseGuards(AuthGuard('jwt'))
    async start(@Req() req: RequestWithUser) {
        await this.cache.set(req.user.sessionId, req.user.id, { ttl: 60 * 5 /* 5 minutes */});

        const user = await this.userService.getById(req.user.id);

        if (isUsPhone(user.phone)) {
            const dto = {
                sessionId: req.user.sessionId,
                ipAddress: req.headers['x-forwarded-for'] as string,
                phone: user.phone
            }
    
            await this.proveService.sendAuthUrl(dto);

            return { type: 'prove'};
        } 
    
        await this.otpService.send(user.phone);
        return { type: 'otp' };
    }


    @Get('prove/finish')
    async finish(@Query('vfp') vfp: string, @Query('sessionId') sessionId: string, @Res() response: Response) {

        const userId = await this.cache.get<string>(sessionId);

        if(!userId) {
            throw new NotFoundException();
        }

        const user = await this.userService.getById(userId);

        const verifications = await this.prismaService.identityVerification.findMany({
            where: {
                userId: user.id,
            }
        });

        if (verifications.length > 0) {
            throw new BadRequestException();
        }

        const { url } = this.configService.get<MerovConfig>('merov');

        const isPhoneVerified = await this.proveService.checkPhoneVerified({ vfp, sessionId });

        await this.prismaService.phoneVerification.create({
            data: {
                userId,
                phone: user.phone,
                provider: 'prove',
                verified: isPhoneVerified,
            }
        })
    
        if (!isPhoneVerified) {
            await this.serverEventsService.add(userId, {
                type: PROVE_FINISH_EVENT,
                provider: 'prove',
                isPhoneVerified
            });

            return response.redirect(`https://${url}/verifications/phone/failed`);
        }

        const isReputationSuccess = await this.sardineService.checkReputation(sessionId, { 
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            emailAddress: user.email
        });

        if (isReputationSuccess) {
            this.eventEmitter.emit(ProveEvents.StartVerification, { userId });
        }

        await this.userService.update(userId, { isPhoneVerified });

        await this.serverEventsService.add(userId, {
            type: PROVE_FINISH_EVENT,
            provider: 'prove',
            isPhoneVerified
        });

        return response.redirect(`https://${url}/verifications/phone/completed`);
    }

    @Post('documents/tokens')
    @UseGuards(AuthGuard('jwt'))
    async getDocumentVerificationTokens(@Req() req: RequestWithUser) {
        return this.sardineService.getIdentityDocumentToken(req.user.sessionId, req.user.id);
    }

    @Post('documents/url')
    @UseGuards(AuthGuard('jwt'))
    async getDocumentVerificationUrl(@Req() req: RequestWithUser) {
        const user = await this.userService.getById(req.user.id);

        if (user.idVerificationStatus === IdentityVerificationStatus.Full ||
            user.idVerificationStatus === IdentityVerificationStatus.Reviewing ||
            user.idVerificationStatus === IdentityVerificationStatus.Blocked)
        {
            throw new BadRequestException();
        }

        const verifications = await this.identityService.findAll({
            where: {
                userId: user.id,
                provider: 'sardine',
                status: 'pending'
            }
        });

        if (verifications.totalCount > 0) {
            const verification = JSON.parse(verifications.response[0].response) as SardineVerificationUrlResponse;

            // if we have a verification that is not expired, return it
            if (new Date(verification.link.expiresAt) > new Date()) {
                return verification;
            }

            // if we have a verification that is expired, delete it and ask for a new one
            await this.identityService.delete({
                userId: user.id,
                provider: 'sardine',
                status: 'pending'
            })
        }

        const response = await this.sardineService.getDocumentVerificationUrl(req.user.sessionId, req.user.id)

        await this.identityService.create(
            {
                id: response.id,
                status: 'pending',
                provider: 'sardine',
                response: JSON.stringify(response)
            }, user.id)
        

        return response;
    }

    @Get('documents/:verificationId')
    @UseGuards(AuthGuard('jwt'))
    async getDocumentVerificationId(@Param('verificationId') verificationId: string, @Req() req: RequestWithUser) {
        return this.sardineService.getDocumentVerificationById(verificationId, req.user.id);
    }
}
