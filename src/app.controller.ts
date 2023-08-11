import { Controller, Get, Req } from '@nestjs/common';
import { ErbnService } from './shared/services/erbn.service';

@Controller()
export class AppController {
    constructor(private readonly erbnService: ErbnService) {}

    @Get('/ping')
    ping(): string {
        return 'pong';
    }


    @Get('/req')
    req(@Req() req) {
        return req;
    }

    @Get('/req/headers')
    headers(@Req() req) {
        return req.headers;
    }

    @Get('/networks')
    networks() {
        return this.erbnService.getNetworks();
    }

}
