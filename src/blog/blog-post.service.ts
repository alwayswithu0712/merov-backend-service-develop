import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { BlogPost } from '@prisma/client'
import { CreateBlogPostDto } from './dto/create-blog-post.dto';

@Injectable()
export class BlogPostService {
    constructor(private prisma: PrismaService) {}

    public async findAll(): Promise<BlogPost[]> {
        return this.prisma.blogPost.findMany({})
    }

    async getById(id: string): Promise<BlogPost> {
        const post = await this.prisma.blogPost.findUnique({
            where: {
                id,
            }
        });

        if (!post) {
            throw new NotFoundException();
        }

        return post;
    }

    async create(data: CreateBlogPostDto): Promise<BlogPost> {
        return this.prisma.blogPost.create({ data });
    }  
}