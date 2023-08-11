import { ExceptionFilter, ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

const errorMap = {
    P1001: HttpStatus.GATEWAY_TIMEOUT,
    P1002: HttpStatus.GATEWAY_TIMEOUT,
    P1003: HttpStatus.NOT_FOUND,
    P1008: HttpStatus.GATEWAY_TIMEOUT,
    P1014: HttpStatus.NOT_FOUND,
    P2000: HttpStatus.BAD_REQUEST,
    P2001: HttpStatus.NOT_FOUND,
    P2002: HttpStatus.UNPROCESSABLE_ENTITY,
    P2005: HttpStatus.BAD_REQUEST,
    P2006: HttpStatus.BAD_REQUEST,
    P2008: HttpStatus.BAD_REQUEST,
    P2010: HttpStatus.BAD_REQUEST,
    P2011: HttpStatus.BAD_REQUEST,
    P2012: HttpStatus.BAD_REQUEST,
    P2013: HttpStatus.BAD_REQUEST,
    P2014: HttpStatus.BAD_REQUEST,
    P2015: HttpStatus.NOT_FOUND,
    P2017: HttpStatus.BAD_REQUEST,
    P2018: HttpStatus.NOT_FOUND,
    P2019: HttpStatus.BAD_REQUEST,
    P2020: HttpStatus.PAYLOAD_TOO_LARGE,
    P2021: HttpStatus.NOT_FOUND,
    P2022: HttpStatus.NOT_FOUND,
    P2023: HttpStatus.BAD_REQUEST,
    P2024: HttpStatus.REQUEST_TIMEOUT,
    P2025: HttpStatus.NOT_FOUND,
    P2026: HttpStatus.METHOD_NOT_ALLOWED,
    P2028: HttpStatus.BAD_REQUEST,
    P2033: HttpStatus.BAD_REQUEST,
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PrismaClientExceptionFilter.name);

    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const errorCode = errorMap[exception.code];
        if (!errorCode) {
            this.logError(HttpStatus.INTERNAL_SERVER_ERROR, exception);
            return this.makeResponse(HttpStatus.INTERNAL_SERVER_ERROR, host, exception);
        }

        this.logError(errorCode, exception);
        return this.makeResponse(errorCode, host, exception);
    }

    /**
     * Catches prisma errors code
     * https://www.prisma.io/docs/reference/api-reference/error-reference
     *
     * @param exception Prisma Error Code
     * @param response Http Status Code
     */
    private makeResponse(status: HttpStatus, host: ArgumentsHost, exception: Prisma.PrismaClientKnownRequestError) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        response.status(status).json({
            statusCode: status,
            data: {prismaCode: exception.code, meta: exception.meta} || exception,
        });
    }

    private logError(status: HttpStatus, exception: Prisma.PrismaClientKnownRequestError) {
        const message = exception.message ? exception.message.replace(/\n/g, '') : JSON.stringify(exception);
        this.logger.error(`Exception thrown ${status}`, exception.message || message);
    }
}
