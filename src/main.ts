import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { utilities, WinstonModule } from 'nest-winston';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaService } from './shared/services/prisma.service';
import * as winston from 'winston';
import configFn from './config/config';
import { GetAWSSecrets } from './shared/services/aws-secrets.service';
import { PrismaClientExceptionFilter } from './shared/exceptions-filter/prisma-client-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonTransport as AxiomTransport } from '@axiomhq/axiom-node/dist/logger';

async function bootstrap() {
    await GetAWSSecrets();

    const config = configFn();

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: true,
        logger: WinstonModule.createLogger({
            format: winston.format.json(),
            defaultMeta: { service: 'merov-backend', env: process.env.NODE_ENV },
            transports: [
                new AxiomTransport(),
                new winston.transports.File({
                    filename: config.logger.fileName,
                    maxFiles: config.logger.maxFiles,
                    maxsize: config.logger.maxFileSize,
                    zippedArchive: config.logger.zipOldLogs,
                }),
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.timestamp(), utilities.format.nestLike()),
                }),
            ],
        }),
    });

    app.useGlobalFilters(new PrismaClientExceptionFilter());
    app.use(helmet());

    const swagger = new DocumentBuilder()
        .setTitle('Merov')
        .setDescription('The Merov API description')
        .setVersion('1.0')
        .addTag('Merov')
        .build();

    const document = SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('api', app, document);

    const prismaService = app.get(PrismaService);
    await prismaService.enableShutdownHooks(app);

    app.setGlobalPrefix('api');

    await app.listen(config.nest.port);

    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
