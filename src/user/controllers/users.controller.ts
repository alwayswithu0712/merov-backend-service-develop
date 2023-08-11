import { Controller, Get, Post, Body, Param, UsePipes, Logger, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { createUserSchema } from '../schema/create-user.scema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserService } from '../user.service';
import { User } from '../dto/user.dto';

@Controller('users')
@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private readonly userService: UserService) {}

    @Post()
    @UsePipes(new JoiValidationPipe(createUserSchema))
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.create(createUserDto);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<User> {
        return this.userService.getById(id);
    }
}
