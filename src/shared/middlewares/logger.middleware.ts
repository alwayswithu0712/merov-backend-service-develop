import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(request: Request, response: Response, next: NextFunction): void {
        const start = new Date().getTime();
        const { ip, method, originalUrl } = request;
        const userAgent = request.get('user-agent') || '';

        response.on('finish', () => {
            const { statusCode } = response;
            const responseTime = (new Date().getTime() - start) / 1000;
            const { username } = request.user as any || {};

            this.logger.log({ method, url: originalUrl, status: statusCode, time: responseTime, user: username,  agent: userAgent, ip }, 'http');
        });

        next();
    }
}
