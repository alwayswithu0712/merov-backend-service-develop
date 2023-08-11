import { Injectable } from '@nestjs/common';
import axios, { Axios, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { PrismaService } from './prisma.service';


@Injectable()
export class ApiClientService {
    private client: Axios;

    constructor(private readonly prismaService: PrismaService) {
        this.client = axios.create();
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        try {
            const response = await this.client.get(url, config);
             this.logResponse(response);
            return response;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                this.logResponse(error);
            }
            throw error;
        }
    }

    async post<T>(url: string, body: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        try {
            const response = await this.client.post(url, body, config);
            this.logResponse<T>(response);
            return response;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                this.logResponse(error);
            }

            throw error;
        }
    }

    async logResponse<T>(response: AxiosResponse<T> | AxiosError): Promise<void> {
        try {
            if (!(response instanceof AxiosError)) {
                await this.prismaService.requestLog.create({
                    data: {
                        url: `${response.config.baseURL}/${response.config.url}`,
                        method: response.config.method.toUpperCase(),
                        status: response.status,
                        request: JSON.stringify(removeSsn(response.config.data)),
                        response: JSON.stringify(removeSsn(response.data)),
                    },
                });
            } else {
                await this.prismaService.requestLog.create({
                    data: {
                        url: `${response.config.baseURL}/${response.config.url}`,
                        method: response.config.method.toUpperCase(),
                        status: response.response.status,
                        request: JSON.stringify(removeSsn(response.config.data)),
                        response: JSON.stringify(removeSsn(response.response.data)),
                    },
                });
            }
        } catch (error) {
            console.error(error);
        }
    }
}

/* Helpers */

function removeSsn(data: any) {
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

    const copy = JSON.parse(JSON.stringify(parsedData));

    function deleteFields(obj: any) {
        for (const key in obj) {
            if (key.toLowerCase().indexOf("ssn") >= 0 || key.toLowerCase().indexOf("AuthenticationUrl") >= 0) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                deleteFields(obj[key]);
            }
        }
    }

    deleteFields(copy);
    return copy;
}