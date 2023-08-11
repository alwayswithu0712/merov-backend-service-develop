import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsConfig, TwilioConfig } from '../../config/config.interface';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
    constructor(private readonly configService: ConfigService) {}

    // twilio
    public async send(phone: string, message: string) {
        const { accountSid, authToken} = this.configService.get<TwilioConfig>('twilio');
        const client = twilio(accountSid, authToken);
        return client.messages.create({
            body: message,
            to: phone,
            from: "+16692912366"
        });
    }

    // sns
    public async sendSNS(phone: string, message: string) {
        const { region } = this.configService.get<AwsConfig>('aws');
        const client = new SNSClient({ region });
        
        const params = {
            Message: message,
            PhoneNumber: phone,
        }

        return client.send(new PublishCommand(params));
    }
}
