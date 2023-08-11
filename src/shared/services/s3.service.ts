import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsConfig } from '../../config/config.interface';
import { S3, Rekognition } from 'aws-sdk';

@Injectable()
export class AwsS3Service {
    private readonly s3: S3;
    private readonly rekognition: Rekognition;

    private readonly logger = new Logger(AwsS3Service.name);

    constructor(private readonly configService: ConfigService) {
        const awsConfig = this.configService.get<AwsConfig>('aws');
        this.s3 = new S3({
            ...awsConfig,
        });
        this.rekognition = new Rekognition({
            ...awsConfig,
            apiVersion: '2016-06-27',
        });
    }

    public async validateModeration(img: Buffer) {
        const params = {
            Image: {
                Bytes: img,
            },
        };
        const response = await this.rekognition.detectModerationLabels(params).promise();
        const detections = response.ModerationLabels;
        if (detections && detections.length > 0) {
            this.logger.error(`Image uploaded contains inappropiate content, ${JSON.stringify(detections)}`);
            throw new BadRequestException('Image contains inappropriate content');
        }
    }

    public async upload(img: Buffer, filename: string, contentType: string): Promise<string> {
        const params = {
            Bucket: this.configService.get<AwsConfig>('aws').s3.bucket,
            Key: filename,
            Body: img,
            ContentType: contentType,
        };
        const response = await this.s3.upload(params).promise();
        return response.Location;
    }
}
