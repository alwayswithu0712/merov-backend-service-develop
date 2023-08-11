import { Injectable, Logger } from '@nestjs/common';
import { Blockchain, Currency } from '../../shared/typings';
import axios from 'axios';
import { CurrenciesService } from '../../currencies/currencies.service';
import { Vault } from '../typings/vault';
import { Pagination } from '../typings/pagination';
import { PaginatedResponse } from '../typings/paginatedResponse';
import { Transaction } from '../typings/transaction';
import { Escrow } from '../typings/escrow';

@Injectable()
export class ErbnService {
    constructor(private currenciesService: CurrenciesService) {}
    erbnEscrowsApiUrl = process.env.ERBN_API_URL;

    accessToken: string;
    expiresIn: Date;
    private readonly logger = new Logger(ErbnService.name);

    calcEscrowFee(valueInUsd: number): number {
        if (valueInUsd < 50000) return 2.5;
        if (valueInUsd < 100000) return 2.25;
        if (valueInUsd < 150000) return 2.0;
        if (valueInUsd < 500000) return 1.85;
        if (valueInUsd < 1000000) return 1.7;
        if (valueInUsd < 5000000) return 1.5;
        if (valueInUsd < 10000000) return 1.3;
        if (valueInUsd < 50000000) return 1.2;
        if (valueInUsd < 100000000) return 1.0;
        return 0.009;
    }

    async getErbnAccessToken(): Promise<string> {
        try {
            if (!this.accessToken || new Date() >= this.expiresIn) {
                const basicKey = Buffer.from(`${process.env.ERBN_CLIENT_ID}:${process.env.ERBN_CLIENT_SECRET}`).toString('base64');

                const response = await axios({
                    method: 'post',
                    baseURL: `${process.env.ERBN_COGNITO_DOMAIN}/oauth2/token?grant_type=client_credentials`,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Basic ${basicKey}`,
                    },
                });

                this.expiresIn = new Date(response.data.expires_in - 60000);

                return response.data.access_token;
            } else {
                return this.accessToken;
            }
        } catch (error) {
            this.logger.error(error);
        }
    }

    async createEscrow(chain: Blockchain, value: number, currency: Currency, payeeAddress: string): Promise<any> {
        const accessKey = await this.getErbnAccessToken();

        const fee = this.calcEscrowFee((await this.currenciesService.getPrice(currency)) * value);

        const { data } = await axios.post(
            `${this.erbnEscrowsApiUrl}/escrows`,
            {
                chain,
                value,
                currency,
                fee,
                payeeAddress,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessKey}`,
                },
            },
        );
        return data;
    }

    async getEscrowById(id: number): Promise<any> {
        const accessKey = await this.getErbnAccessToken();

        const { data } = await axios.get(`${this.erbnEscrowsApiUrl}/escrows/${id}`, {
            headers: {
                Authorization: `Bearer ${accessKey}`,
            },
        });

        return data;
    }

    async getNetworks(): Promise<any> {
        const { data } = await axios.get(`${this.erbnEscrowsApiUrl}/networks`);

        return data;
    }

    async refundEscrow(escrowId: number): Promise<string> {
        const accessKey = await this.getErbnAccessToken();

        const { data } = await axios.get(`${this.erbnEscrowsApiUrl}/escrows/${escrowId}/refund`, {
            headers: {
                Authorization: `Bearer ${accessKey}`,
            },
        });

        return data.payoutHash;
    }

    async releaseEscrow(escrowId: number): Promise<string> {
        const accessKey = await this.getErbnAccessToken();

        const { data } = await axios.get(`${this.erbnEscrowsApiUrl}/escrows/${escrowId}/release`, {
            headers: {
                Authorization: `Bearer ${accessKey}`,
            },
        });
        return data.payoutHash;
    }

    async closeEscrow(escrowId: number): Promise<void> {
        const accessKey = await this.getErbnAccessToken();

        await axios.get(`${this.erbnEscrowsApiUrl}/escrows/${escrowId}/close`, {
            headers: {
                Authorization: `Bearer ${accessKey}`,
            },
        });
    }

    async getVaults(): Promise<Vault> {
        const accessKey = await this.getErbnAccessToken();

        const { data } = await axios.get(`${this.erbnEscrowsApiUrl}/vaults`, {
            headers: {
                Authorization: `Bearer ${accessKey}`,
            },
        });

        return data;
    }

    async getTransactions(pagination: Pagination): Promise<PaginatedResponse<Transaction>> {
        const accessKey = await this.getErbnAccessToken();

        const { data } = await axios.get(`${this.erbnEscrowsApiUrl}/transactions`, {
            headers: {
                Authorization: `Bearer ${accessKey}`,
            },
            params: {
                pagination: JSON.stringify(pagination)
            },
        });

        return data;
    }

    async getTransaction(hash: string): Promise<Transaction> {
        const accessKey = await this.getErbnAccessToken();

        const { data } = await axios.get(`${this.erbnEscrowsApiUrl}/transactions/${hash}`, {
            headers: {
                Authorization: `Bearer ${accessKey}`,
            },
        });
        return data;
    }

    async getEscrows(pagination: Pagination): Promise<PaginatedResponse<Escrow>> {
        const accessKey = await this.getErbnAccessToken();

        const { data } = await axios.get(`${this.erbnEscrowsApiUrl}/escrows`, {
            headers: {
                Authorization: `Bearer ${accessKey}`,
            },
            params: {
                pagination: JSON.stringify(pagination)
            },
        });

        return data;
    }

    handleEscrowReleasedEvent = async () => {
        return;
    };

    handleEscrowRefundedEvent = async () => {
        return;
    };

    handleEscrowClosedEvent = async () => {
        return;
    };
}
