import{Body, Controller, Delete, Get,Req, Post, Param, Patch, SerializeOptions, UseGuards, ContextType} from '@nestjs/common';



@Controller('pool/v1/status')

export class V1PoolController{
    @Get()
    findAll() : string{
        return 'This is the first response of Mr.Mawk';
    }
}