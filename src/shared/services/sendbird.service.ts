import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface CreateSendBirdUser {
    user_id: string;
    nickname: string;
    profile_url: string;
}

@Injectable()
export class SendBirdService {
    private readonly logger = new Logger(SendBirdService.name);

    constructor(private readonly configService: ConfigService) {}

    async createUser(user: CreateSendBirdUser) {
        const { appId, apiToken } = this.configService.get('sendbird');

        const url = `https://api-${appId}.sendbird.com/v3/users`;
        const headers = {
            'Content-Type': 'application/json',
            'Api-Token': apiToken,
        };

        const body = {
            ...user,
            issue_access_token: true,
        };

        const response = await axios.post(url, body, { headers });
        return { accessToken: response.data.access_token };
    }

    async updateUser(userId: string, body: { profile_url: string }): Promise<void> {
        const { appId, apiToken } = this.configService.get('sendbird');

        const url = `https://api-${appId}.sendbird.com/v3/users/${userId}`;

        const headers = {
            'Content-Type': 'application/json',
            'Api-Token': apiToken,
        };

        try {
            await axios.put(url, body, { headers });
        } catch (err) {
            this.logger.error(`Error updating user ${userId}`, err);
        }
    }

    async getOrCreateUser(user: CreateSendBirdUser) {
        const { appId, apiToken } = this.configService.get('sendbird');
        const url = `https://api-${appId}.sendbird.com/v3/users/${user.user_id}`;
        const headers = {
            'Content-Type': 'application/json',
            'Api-Token': apiToken,
        };

        try {
            const maybeUser = await axios.get(url, { headers });
            return { accessToken: maybeUser.data.access_token };
        } catch (e) {
            return this.createUser(user);
        }
    }

    async getChatsForUser(userId: string) {
        const { appId, apiToken } = this.configService.get('sendbird');
        const limit = 100;
        const chats = [];

        const headers = {
            'Content-Type': 'application/json',
            'Api-Token': apiToken,
        };

        const getUrl = (tokenForNextMessages: string) =>
            `https://api-${appId}.sendbird.com/v3/users/${userId}/my_group_channels?show_empty=true&limit=${limit}&order=latest_last_message${
                tokenForNextMessages ? '&token=' + tokenForNextMessages : ''
            }`;

        const getData = async (tokenForNextMessages: string = '') => {
            const response = await axios.get(getUrl(tokenForNextMessages), { headers });
            chats.push(...response.data.channels);
            if (response.data.channels.length === limit) {
                await getData(response.data.next);
            }
            return chats;
        };
        return getData();
    }

    async createProductChannel(channelId: string, sellerId: string, buyerId: string) {
        const { appId, apiToken } = this.configService.get('sendbird');

        const url = `https://api-${appId}.sendbird.com/v3/group_channels`;
        const headers = {
            'Content-Type': 'application/json',
            'Api-Token': apiToken,
        };

        const body = {
            user_ids: [buyerId, sellerId],
            channel_url: channelId,
        };

        const response = await axios.post(url, body, { headers });

        return { channelUrl: response.data.channel_url };
    }
}
