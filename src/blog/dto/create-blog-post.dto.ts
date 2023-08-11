import { Prisma} from '@prisma/client';

export class CreateBlogPostDto implements Prisma.BlogPostCreateInput {
    id?: string
    createdAt?: Date | string
    description: string
    title: string
    images?: Array<string>
}



