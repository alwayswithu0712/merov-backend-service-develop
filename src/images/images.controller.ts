import {
    BadRequestException,
    Controller,
    Logger,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AwsS3Service } from '../shared/services/s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('images')
@UseGuards(AuthGuard('jwt'))
export class ImagesController {
    constructor(private readonly s3Service: AwsS3Service) {}

    private readonly logger = new Logger(ImagesController.name);

    @Post()

    @UseInterceptors(FileInterceptor('image'))
    async post(
        @UploadedFile(
            new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: 2000 * 1024 })],
            }),
        )
        file: Express.Multer.File,
    ): Promise<{}> {
        await this.s3Service.validateModeration(file.buffer);

        const split = file.originalname.split('.');

        if (split.length < 2) {
            throw new BadRequestException('Invalid file name');
        }

        const filename = `${split[split.length - 2]}${new Date().getTime()}.${split[split.length - 1]}`;

        const location = await this.s3Service.upload(file.buffer, filename, file.mimetype);

        return { url: location };
    }
}
