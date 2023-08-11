import { Controller, UseGuards, Get, Param, SerializeOptions } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from '../chats.service';
import { GetPagination } from '../../shared/decorators/pagination.decorator';
import { Pagination } from '../../shared/typings/pagination';
import RoleGuard from '../../auth/role.guard';
import { Role } from '../../auth/typings/role';
import { MEROV_ADMIN } from '../../shared/typings/groups';
import { Chat } from '../dto/chat';

@Controller('admin/chats')
@ApiTags('Chat')
@UseGuards(AuthGuard('jwt'))
@UseGuards(RoleGuard(Role.MerovAdmin))
@SerializeOptions({ groups: [MEROV_ADMIN] })
export class AdminChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('/:id')
    async getById(@Param('id') id: string): Promise<Chat> {
        return this.chatService.getById(id);
    }

    @Get()
    async get(@GetPagination() pagination: Pagination): Promise<Chat[]> {
        return this.chatService.findAll(pagination);
    }
}
