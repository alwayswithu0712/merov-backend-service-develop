import axios from "axios";
import * as dotenv from 'dotenv';

dotenv.config();

const sendbird = {
    appId: process.env.SENDBIRD_APP_ID,
    apiToken: process.env.SENDBIRD_API_TOKEN,
};

const listChannels = async () => {
    const { appId, apiToken } = sendbird;

    const url = `https://api-${appId}.sendbird.com/v3/group_channels`;
    const headers = {
        'Content-Type': 'application/json',
        'Api-Token': apiToken,
    };

    const response = await axios.get(url, { headers });
    console.log({response: response.data.channels.map(c => c.channel_url)});
    return response.data.channels.map(c => c.channel_url);
}

const deleteChannel = async (channelUrl: string) => {
    const { appId, apiToken } = sendbird;

    const url = `https://api-${appId}.sendbird.com/v3/group_channels/${channelUrl}`;
    const headers = {
        'Content-Type': 'application/json',
        'Api-Token': apiToken,
    };

    const response = await axios.delete(url, { headers });
    console.log({response: response.data});
    return response.data;
}

export const deleteAllChannels = async () => {
    const channels = await listChannels();
    for (const channel of channels) {
        console.log(`Deleting channel ${channel}`);
        await deleteChannel(channel);
    }
}

export const getUserById = async (userId: string) => {
    const { appId, apiToken } = sendbird;

    const url = `https://api-${appId}.sendbird.com/v3/users/${userId}`;
    const headers = {
        'Content-Type': 'application/json',
        'Api-Token': apiToken,
    };

    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (err) {
        return null;
    }

}

export const createUser = async (user: any) => {
    const { appId, apiToken } = sendbird;

    const url = `https://api-${appId}.sendbird.com/v3/users`;
    const headers = {
        'Content-Type': 'application/json',
        'Api-Token': apiToken,
    };

    const body = {
        ...user,
        issue_access_token: true,
    }

    const response = await axios.post(url, body, { headers });
    return response.data;
}