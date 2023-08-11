import { Body, Controller, Get, Param, Post, Req, UnauthorizedException, UseGuards, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../shared/pipes/validation.pipe';
import { BlogPostService } from './blog-post.service';
import { createBlogPostSchema } from './schema/create-blog-post.schema';
import { BlogPost } from '@prisma/client'
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../auth/typings/requestWithUser';
import { UserService } from '../user/user.service';

@Controller('blog/posts')
@ApiTags('Blog')
@UseGuards(AuthGuard('jwt'))
export class BlogPostController {
    constructor(private readonly blogPostService: BlogPostService, private readonly userService: UserService) {}

    @Get("/:id")
    async get(@Param('id') id: string): Promise<BlogPost> {
        return this.blogPostService.getById(id);
    }

    @Post()
    @UsePipes(new JoiValidationPipe(createBlogPostSchema))
    async create(@Req() req: RequestWithUser, @Body() body: CreateBlogPostDto): Promise<BlogPost> {
        const user = await this.userService.getById(req.user.id);

        if(!user.email.includes('@merov.io')) {
            throw new UnauthorizedException();
        }

        return this.blogPostService.create(body);
    }
}