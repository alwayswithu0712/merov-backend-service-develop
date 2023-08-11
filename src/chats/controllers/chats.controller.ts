import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    UsePipes,
    Get,
    Param,
    UnauthorizedException,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from '../../auth/typings/requestWithUser';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { CreateChatDto } from '../dto/create-chat.dto';
import { createProductChatSchema } from '../schema/create-product-chat.schema';
import { ChatService } from '../chats.service';
import { Chat } from '../dto/chat';
import { GetPagination } from '../../shared/decorators/pagination.decorator';
import { Pagination } from '../../shared/typings/pagination';
import PermissionGuard from '../../shared/pipes/permissions.guard';
import { Permission } from '../../shared/typings';

@Controller('chats')
@ApiTags('Chat')
@UseGuards(PermissionGuard([Permission.Chats]))
@UseInterceptors(ClassSerializerInterceptor)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post()
    @UsePipes(new JoiValidationPipe(createProductChatSchema))
    async createProductChat(@Req() req: RequestWithUser, @Body() createProductChatDto: CreateChatDto): Promise<Chat> {
        const accountId = req.user.accountId;
        return this.chatService.getOrCreateChat(createProductChatDto, accountId);
    }

    @Get('/:id')
    async getById(@Req() req: RequestWithUser, @Param('id') id: string): Promise<Chat> {
        const accountId = req.user.accountId;
        const chat = await this.chatService.getById(id);

        if (accountId !== chat.buyerId && accountId !== chat.sellerId) {
            throw new UnauthorizedException();
        }

        return chat;
    }

    @Get()
    async get(@Req() req: RequestWithUser, @GetPagination() pagination: Pagination): Promise<Chat[]> {
        const accountId = req.user.accountId;

        const params = {
            ...pagination,
            take: undefined,
            where: {
                OR: [{ buyerId: accountId }, { sellerId: accountId }],
            },
        };

        return this.chatService.findAll(params);
    }
}
