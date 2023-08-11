import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProveConfig } from '../config/config.interface';
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosRequestConfig } from 'axios';
import * as qs from 'qs';
import {
    ProveAuthUrlDto,
    ProveAuthUrlResponse,
    ProveIdentityDto,
    ProveIdentityResponse,
    ProveInstantLinkResult,
    ProveInstantLinkResultDto,
    ProveTrustDto,
    ProveTrustResponse,
    ProveVerifyDto,
    ProveVerifyResponse,
} from './dto/prove.dto';

import { ApiClientService } from '../shared/services/api-client.service';
import { SmsService } from '../shared/services/sms.service';

const MIN_TRUST_SCORE = 630;

interface IAccessToken {
    access_token: string;
    expires_in: number;
    id_token: string;
    session_state?: string;
    token_type?: string;
}
@Injectable()
export class ProveService {
    proveConfig: ProveConfig;
    accessToken: IAccessToken;
    identityAccessToken: IAccessToken;

    private logger = new Logger(ProveService.name);

    constructor(
        config: ConfigService,
        private readonly client: ApiClientService,
        private readonly smsService: SmsService,
    ) {
        this.proveConfig = config.get('prove');
    }

    getConfig(accessToken: IAccessToken): AxiosRequestConfig {
        const config = {
            baseURL: this.proveConfig.apiUrl,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'request-id': `${uuidv4()}`,
                authorization: `Bearer ${accessToken.access_token}`,
            },
        };

        return config;
    }

    async getAccessToken(): Promise<IAccessToken> {
        if (this.accessToken && this.accessToken.expires_in > Date.now()) {
            return Promise.resolve(this.accessToken);
        }

        const url = `${this.proveConfig.apiUrl}/token`;

        const params = qs.stringify({
            grant_type: 'password',
            username: this.proveConfig.username,
            password: this.proveConfig.password,
        });

        const config = {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        const { data } = await axios.post(url, params, config);

        this.accessToken = data;

        return data;
    }

    async getIdentityAccessToken(): Promise<IAccessToken> {
        if (this.identityAccessToken && this.identityAccessToken.expires_in > Date.now()) {
            return Promise.resolve(this.identityAccessToken);
        }

        const url = `${this.proveConfig.apiUrl}/token`;
        const params = qs.stringify({
            grant_type: 'password',
            username: this.proveConfig.identityUsername,
            password: this.proveConfig.identityPassword,
        });
        const config = {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        const { data } = await axios.post(url, params, config);

        this.identityAccessToken = data;

        return data;
    }

    async sendAuthUrl(dto: ProveAuthUrlDto): Promise<void> {
        const response = await this.getAuthUrl(dto);
        await this.smsService.send(
            dto.phone,
            `Your Merov verification link is: ${response.Response.AuthenticationUrl}. Please do not share this link with anyone.`,
        );
    }

    private async getAuthUrl(dto: ProveAuthUrlDto): Promise<ProveAuthUrlResponse> {
        const env = process.env.NODE_ENV;

        const accessToken = await this.getAccessToken();
        const config = this.getConfig(accessToken);

        const data = {
            RequestId: `${uuidv4()}`,
            SessionId: dto.sessionId,
            ApiClientId: this.proveConfig.clientId,
            SourceIp: dto.ipAddress,
            MobileNumber: dto.phone,
            FinalTargetUrl: `https://${env}.api.merov.io/api/identity/verify/prove/finish?sessionId=${dto.sessionId}`,
            GenerateAuthenticationCode: true,
        };

        const response = await this.client.post<ProveAuthUrlResponse>('fortified/2015/06/01/getAuthUrl', data, config);
        return response.data;
    }

    async checkPhoneVerified(dto: ProveInstantLinkResultDto): Promise<boolean> {
        const instantLinkResult = await this.instantLinkResult(dto);

        const { LinkClicked, PhoneMatch, IpAddressMatch } = instantLinkResult.Response;

        if (instantLinkResult.Status !== 0) return false;
        if (!LinkClicked) return false;
        if (!PhoneMatch && !IpAddressMatch) return false;

        return true;
    }

    private async instantLinkResult(dto: ProveInstantLinkResultDto): Promise<ProveInstantLinkResult> {
        const accessToken = await this.getAccessToken();
        const config = this.getConfig(accessToken);

        const data = {
            RequestId: uuidv4(),
            SessionId: dto.sessionId,
            ApiClientId: this.proveConfig.clientId,
            verificationFingerprint: dto.vfp,
        };

        const response = await this.client.post<ProveInstantLinkResult>('fortified/2015/06/01/instantLinkResult', data, config);
        return response.data;
    }

    async checkPhoneReputation(dto: ProveTrustDto): Promise<boolean> {
        const response = await this.trust(dto);
        return response.status === 0 && response.response.trustScore > MIN_TRUST_SCORE;
    }

    private async trust(dto: ProveTrustDto): Promise<ProveTrustResponse> {
        const accessToken = await this.getIdentityAccessToken();
        const config = this.getConfig(accessToken);

        const data = {
            requestId: uuidv4(),
            consentStatus: 'optedIn',
            phoneNumber: dto.phone,
            details: true,
        };

        const response = await this.client.post<ProveTrustResponse>('trust/v2', data, config);
        return response.data;
    }

    async identity(dto: ProveIdentityDto): Promise<ProveIdentityResponse> {
        const accessToken = await this.getAccessToken();
        const config = this.getConfig(accessToken);

        const data = {
            requestId: uuidv4(),
            dob: dto.dateOfBirth.toISOString().split('T')[0],
            phoneNumber: dto.phone,
            details: true,
        };

        const response = await this.client.post<ProveIdentityResponse>('identity/v2', data, config);
        return response.data;
    }

    async verify(dto: ProveVerifyDto): Promise<ProveVerifyResponse> {
        const accessToken = await this.getAccessToken();
        const config = this.getConfig(accessToken);

        const data = {
            requestId: uuidv4(),
            dob: dto.dateOfBirth,
            phoneNumber: dto.phone,
            firstName: dto.firstName,
            lastName: dto.lastName,
            address: dto.address,
            city: dto.city,
            region: dto.region,
            postalCode: dto.postalCode,
            ssn: dto.ssn,
            details: true,
        };

        const response = await this.client.post<ProveVerifyResponse>('identity/verify/v2', data, config);
        return response.data;
    }

    
}
