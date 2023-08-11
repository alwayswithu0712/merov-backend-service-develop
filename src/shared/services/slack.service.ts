import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/client';
import { SlackConfig } from '../../config/config.interface';

@Injectable()
export class SlackService {
    private slack: WebClient;

    constructor(configService: ConfigService) {
        const { token } = configService.get<SlackConfig>('slack');
        this.slack = new WebClient(token);
    }

    async sendMessage(channel: string, text: string) {
        try {
            await this.slack.chat.postMessage({ channel, text });
            await this.slack.chat.postMessage({ channel, text: '--------------------' });
        }
        catch (error) {
            console.log(error);
        }
    }
}