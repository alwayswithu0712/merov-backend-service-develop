import { Module } from '@nestjs/common';
import { BlogPostService } from './blog-post.service';
import { BlogPostController } from './blog-post.controller';
import { PrismaService } from '../shared/services/prisma.service';
import { UsersModule } from 'src/user/user.module';

@Module({
    imports: [UsersModule],
    controllers: [BlogPostController],
    providers: [BlogPostService, PrismaService],
    exports: [BlogPostService],
})
export class BlogModule {}