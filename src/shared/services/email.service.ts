import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsConfig } from '../../config/config.interface';

@Injectable()
export class EmailService {
    private readonly sesClient: SESClient;

    constructor(private readonly configService: ConfigService) {
        const awsConfig = this.configService.get<AwsConfig>('aws');

        this.sesClient = new SESClient({ region: awsConfig.region });
    }

    public async send(to: string, subject: string, body: string) {
        const params = {
            Destination: {
                CcAddresses: ['nico@merov.io'],
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject,
                },
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `<html><body>${body}</body></html>`,
                    },
                },
            },
            Source: 'no-reply@merov.io',
            ReplyToAddresses: [],
        };

        await this.sesClient.send(new SendEmailCommand(params));
    }
}
