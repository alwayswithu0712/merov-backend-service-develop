import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResponse, toPaginatedResponse } from '../shared/typings/paginatedResponse';
import { PrismaService } from '../shared/services/prisma.service';
import { CreateIdentityVerificationDto } from './dto/create-identity-verification.dto';
import { IdentityVerification } from './dto/identity-verification';

@Injectable()
export class IdentityVerificationsService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async create(createIdentityVerificationDto: CreateIdentityVerificationDto, userId: string): Promise<IdentityVerification> {
        const verificaton = await this.prisma.identityVerification.create({
            data: {
                ...createIdentityVerificationDto,
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
        
        // const backofficeConfig = this.configService.get<BackofficeConfig>('backoffice');
        // const kycConfig = this.configService.get<KycConfig>('kyc');
        // await this.emailService.send(
        //     `${kycConfig.notifyTo}`,
        //     `[New] KYC ready to review`,
        //     `Please go to ${backofficeConfig.url}/kyc/${verificaton.id} to check the KYC`,
        // );
        
        return new IdentityVerification(verificaton);
    }

    async delete(where: Prisma.IdentityVerificationWhereInput): Promise<void> {
        await this.prisma.identityVerification.deleteMany({ where });
    }

    async getById(id: string): Promise<IdentityVerification | null> {
        const verification = await this.prisma.identityVerification.findUnique({
            where: {
                id,
            },
        });

        if (!verification) {
            return null;
        }
        
        return new IdentityVerification(verification);
    }

    async findAll(params: {
        where?: Prisma.IdentityVerificationWhereInput;
        orderBy?: Prisma.IdentityVerificationOrderByWithRelationAndSearchRelevanceInput;
        skip?: number;
        take?: number;
    }): Promise<PaginatedResponse<IdentityVerification>> {
        const count = await this.prisma.identityVerification.count({
            where: params.where,
        });
        const verifications = await this.prisma.identityVerification.findMany({
            ...params,
        });

        return toPaginatedResponse(
            verifications.map((verification) => new IdentityVerification(verification)),
            count,
            params.skip,
            params.take,
        );
    }

    async update(id: string, data: Prisma.IdentityVerificationUpdateInput): Promise<IdentityVerification> {
        const verification = await this.prisma.identityVerification.update({
            where: {
                id,
            },
            data,
        });

        return new IdentityVerification(verification);
    }
}
