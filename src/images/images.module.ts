import { Module } from '@nestjs/common';
import { AwsS3Service } from '../shared/services/s3.service';

import { ImagesController } from './images.controller';

@Module({
    controllers: [ImagesController],
    providers: [AwsS3Service],
})
export class ImagesModule {}
