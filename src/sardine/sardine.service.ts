import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiClientService } from '../shared/services/api-client.service';
import { SardineConfig } from '../config/config.interface';
import { CreateDocumentUrlDto } from '../verifications/dto/create-document-url.dto';
import { AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { SardineVerificationResult } from './dto/verification-result';
import { SardineCustomer } from './dto/customer';
import { SardineCustomersResponse, SardineTokenResponse, SardineVerificationUrlResponse } from './dto/responses';
import { SardineRiskLevels } from './dto/risk-levels';


@Injectable()
export class SardineService {
    auth: string;
    sardineConfig: SardineConfig;
    requestConfig: AxiosRequestConfig;

    private readonly logger = new Logger(SardineService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly client: ApiClientService,
    ) {
        this.sardineConfig = this.configService.get<SardineConfig>('sardine');

        this.requestConfig = {
            baseURL: this.sardineConfig.apiUrl,
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.SARDINE_CLIENT_ID}:${process.env.SARDINE_CLIENT_SECRET}`).toString(
                    'base64',
                )}`,
            },
        };
    }

    async checkReputation(sessionKey: string, user: SardineCustomer): Promise<boolean> {
        const customer = {
            ...user,
            isEmailVerified: true,
            isPhoneVerified: true,
        };

        const { level } = await this.customers(sessionKey, customer, 'COMPLETE_PROFILE');

        return level === SardineRiskLevels.Low || level === SardineRiskLevels.Medium;
    }

    private async customers(sessionKey: string, customer: SardineCustomer, flow: string): Promise<SardineCustomersResponse> {
        const body = {
            flow,
            sessionKey,
            checkpoints: ['customer'],
            customer: {
                ...customer,
                dateOfBirth: customer.dateOfBirth.toISOString().split('T')[0],
            },
        };

        const response = await this.client.post<SardineCustomersResponse>('v1/customers', body, this.requestConfig);

        return response.data;
    }

    async getVerificationImages(verificationId: string): Promise<unknown> {
        const body = {
            verificationId,
            images: ['front', 'back', 'selfie'],
        };

        const response = await this.client.post(`v1/identity-documents/verifications/images`, body, this.requestConfig);

        return response.data;
    }

    async getDocumentVerificationUrl(
        sessionKey: string,
        userId: string,
        inputData?: CreateDocumentUrlDto,
    ): Promise<SardineVerificationUrlResponse> {
        const body = {
            sessionKey,
            idback: false,
            selfie: false,
            locale: 'en-us',
            customerId: userId,
            inputData,
        };

        const response = await this.client.post<SardineVerificationUrlResponse>('v1/identity-documents/urls', body, this.requestConfig);

        return response.data;
    }

    async getIdentityDocumentToken(sessionKey: string, userId: string): Promise<SardineTokenResponse> {
        const body = {
            sessionKey,
            customerId: userId,
            platform: 'ios',
            provider: 'incode',
        };

        const response = await this.client.post<SardineTokenResponse>('v1/identity-documents/tokens', body, this.requestConfig);

        return response.data;
    }

    async getDocumentVerificationById(verificationId: string, userId: string): Promise<SardineVerificationResult> {
        const config = {
            params: {
                type: 'mobilesdk',
                customerId: userId,
            },
            ...this.requestConfig,
        };

        const response = await this.client.get<SardineVerificationResult>(`v1/identity-documents/verifications/${verificationId}`, config);

        return response.data;
    }

    async feedbacks(sessionKey: string, userId: string, status: string): Promise<void> {
        const body = {
            sessionKey,
            customer: {
                id: userId,
            },
            feedback: {
                id: uuidv4(),
                type: 'onboarding',
                status,
                timeMillis: new Date().getTime(),
            },
        };

        await this.client.post('v1/feedbacks', body, this.requestConfig);
    }
}
