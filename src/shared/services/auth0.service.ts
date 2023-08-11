import { Injectable, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid'
import { generateId } from '../helpers/id';
import { UpdateAuth0User, EmailTemplate } from "../typings/auth0.dto";
import { Permission } from "../typings/permissions";
import { castPermission } from "../helpers/permission"

import axios, { AxiosResponse } from 'axios';

@Injectable()
export class Auth0Service {
    accessToken: string;
    expiresIn: Date;
    private readonly logger = new Logger(Auth0Service.name);

    async getAuth0AccessToken(): Promise<string> {
        try {
            if (!this.accessToken || new Date() >= this.expiresIn) {
                const options = {
                    method: 'POST',
                    url: `${process.env.AUTH0_ISSUER_BASE_URL}oauth/token`,
                    headers: { 'content-type': 'application/json' },
                    data: {
                        grant_type: 'client_credentials',
                        client_id: process.env.AUTH0_FRONTEND_CLIENT_ID,
                        client_secret: process.env.AUTH0_FRONTEND_CLIENT_SECRET,
                        audience: process.env.AUTH0_AUDIENCE,
                    },
                };
                const { data } = await axios.request(options);
                this.accessToken = data.access_token;
                this.expiresIn = new Date(data.expires_in - 60000);
            }

            return this.accessToken;
        } catch (error) {
            this.logger.error(error);
        }
    }

    async createUser(data: any): Promise<{ user_id: string }>  {
        try {
            const accessToken = await this.getAuth0AccessToken();
            const options = {
                method: 'POST',
                url: `${process.env.AUTH0_ISSUER_BASE_URL}api/v2/users`,
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${accessToken}`,
                },
                data,
            };
            let { data: resData } = await axios.request(options);
            return resData;
        } catch (err) {
            this.logger.error(err);
        }
    }

    async patch(userId: string, data: UpdateAuth0User): Promise<AxiosResponse> {
        const accessToken = await this.getAuth0AccessToken();
        const options = {
            method: 'PATCH',
            url: `${process.env.AUTH0_ISSUER_BASE_URL}api/v2/users/${userId}`,
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`,
            },
            data,
            validateStatus: (status: number) => status >= 200 && status < 500,
        };
        try {
            return await axios.request(options);
        } catch (err) {
            this.logger.error(err);
        }
    }

    async addPermissions(authId: string, permissions: string[]): Promise<AxiosResponse> {
        const accessToken = await this.getAuth0AccessToken();
        const options = {
            method: 'POST',
            url: `${process.env.AUTH0_ISSUER_BASE_URL}api/v2/users/${authId}/permissions`,
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`,
            },
            data: {
                permissions: permissions.map((permission) => ({ permission_name: permission, resource_server_identifier: process.env.AUTH0_MEROV_AUDIENCE }))              
            },
            validateStatus: (status: number) => status >= 200 && status < 500,
        };
        try {
            return await axios.request(options);
        } catch (err) {
            this.logger.error(err);
        }
    }

    async removePermissions(userId: string, permissions: string[]): Promise<void> {
        try {
            const accessToken = await this.getAuth0AccessToken();
            const options = {
                method: 'DELETE',
                url: `${process.env.AUTH0_ISSUER_BASE_URL}api/v2/users/${userId}/permissions`,
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${accessToken}`,
                },
                data: {
                    permissions: permissions.map((permission) => ({ permission_name: permission, resource_server_identifier: process.env.AUTH0_MEROV_AUDIENCE }))              
                },
            };
            await axios.request(options);
        } catch (err) {
            this.logger.error(err);
        }
    }

    async getPermissions(auth0Id: string): Promise<Permission[]> {
        try {
            const accessToken = await this.getAuth0AccessToken();
            const options = {
                method: 'GET',
                url: `${process.env.AUTH0_ISSUER_BASE_URL}api/v2/users/${auth0Id}/permissions`,
                headers: {
                    authorization: `Bearer ${accessToken}`,
                },
            };
            const { data } = await axios.request(options);
            return data.map((permission: {permission_name: string}) => {
                return castPermission(permission.permission_name);
            }).filter(x => x);
        } catch (err) {
            this.logger.error(err);
        }
    }

    async changePassword(userId: string, password: string) {
        try {
            const accessToken = await this.getAuth0AccessToken();
            const options = {
                method: 'PATCH',
                url: `${process.env.AUTH0_ISSUER_BASE_URL}api/v2/users/${userId}`,
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${accessToken}`,
                },
                data: { password, connection: 'Username-Password-Authentication' },
            };
            await axios.request(options);
        } catch (err) {
            this.logger.error(err);
        }
    }

    // common api
    async resetPassword(email: string) {
        try {
            const accessToken = await this.getAuth0AccessToken();
            const options = {
                method: 'POST',
                url: `${process.env.AUTH0_ISSUER_BASE_URL}dbconnections/change_password`,
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${accessToken}`,
                },
                data: { email, connection: 'Username-Password-Authentication' },
            };
            await axios.request(options);
        } catch (err) {
            this.logger.error(err);
        }
    }

    async inviteMember(
        email: string,
        senderEmail: string,
        orgName: string,
        accountId: string,
        inviteId: string,
        permissions: Permission[]
    ) {
        let { user_id: authId } = await this.createUser({
            email,
            password: nanoid(),
            username: generateId(),
            app_metadata: {
                invited: true,
                used_invite: false,
                inviteId,
                inviting_org: orgName,
                invite_sender_email: senderEmail,
                accountId
            },
            user_metadata: {},
            connection: 'Username-Password-Authentication',
            blocked: false,
            email_verified: true,
            verify_email: false
        });
        await this.resetPassword(email);
        await this.addPermissions(authId, permissions);
    }

    async sendVerificationEmail(userId: string) {
        try {
            const accessToken = await this.getAuth0AccessToken();

            const options = {
                method: 'POST',
                url: `${process.env.AUTH0_ISSUER_BASE_URL}api/v2/jobs/verification-email`,
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${accessToken}`,
                },
                data: { user_id: userId, client_id: process.env.AUTH0_FRONTEND_CLIENT_ID },
            };
            await axios.request(options);
        } catch (err) {
            this.logger.error(err);
        }
    }

    async getEmailTemplate(template: EmailTemplate): Promise<any> {
        try {
            const accessToken = await this.getAuth0AccessToken();

            const options = {
                method: 'GET',
                url: `${process.env.AUTH0_ISSUER_BASE_URL}api/v2/email-templates/${template}`,
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${accessToken}`,
                },
            };
            return await axios.request(options);
        } catch (err) {
            this.logger.error(err);
        }
    }


}
