import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from '../categories.service';
import { Category, Subcategory } from '../dto/category';

@Controller('categories')
@ApiTags('Categories')
export class CategoriesController {
    private readonly logger = new Logger(CategoriesController.name);

    constructor(private readonly categoriesService: CategoriesService) {}

    @Get(':categoryId/subcategories')
    async getSubcategories(@Param('categoryId') categoryId: string): Promise<Subcategory[]> {
        return this.categoriesService.findSubcategories(categoryId);
    }

    @Get()
    async getCategories(): Promise<Category[]> {
        return this.categoriesService.findCategories();
    }
}
