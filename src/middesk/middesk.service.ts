import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { MiddeskConfig } from '../config/config.interface';
import { ApiClientService } from '../shared/services/api-client.service';
import { MiddeskBusiness } from '../shared/typings/middesk-business.dto';
import { CreateMiddeskBusinessDto } from './dto/create-business';

@Injectable()
export class MiddeskService {
    private middeskConfig: MiddeskConfig;

    constructor(
        @Inject(ConfigService) readonly configService: ConfigService,
        private readonly client: ApiClientService,
    ) {
        this.middeskConfig = this.configService.get<MiddeskConfig>('middesk');
    }

    private getConfig(): AxiosRequestConfig {
        const config = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                authorization: `Bearer ${this.middeskConfig.accessKey}`,
            },
        };

        return config;
    }

    public async createBusiness(data: CreateMiddeskBusinessDto, organizationId: string): Promise<MiddeskBusiness> {
        const response = await this.client.post<MiddeskBusiness>(
            `${this.middeskConfig.apiUrl}/businesses`,
            { external_id: organizationId, ...data },
            this.getConfig(),
        );

        return response.data;
    }

    public async getMiddeskBusinessById(id: string): Promise<MiddeskBusiness> {
        const result = await this.client.get<MiddeskBusiness>(`${this.middeskConfig.apiUrl}/businesses/${id}`, this.getConfig());
        return result.data;
    }

    public async getMiddeskAllBusiness(): Promise<MiddeskBusiness[]> {
        const result = await this.client.get<MiddeskBusiness[]>(`${this.middeskConfig.apiUrl}/businesses`, this.getConfig());
        return result.data;
    }
}
