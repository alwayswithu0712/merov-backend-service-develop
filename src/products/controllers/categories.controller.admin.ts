import { Body, Controller, Delete, Logger, Param, Patch, Post, SerializeOptions, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import RoleGuard from '../../auth/role.guard';
import { Role } from '../../auth/typings/role';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto } from '../dto/category.dto';
import { createCategorySchema } from '../schema/create-category-schema';
import { createSubcategorySchema } from '../schema/create-subcategory-schema';
import { Category, Subcategory } from '../dto/category';
import { MEROV_ADMIN } from '../../shared/typings/groups';
import { updateCategorySchema } from '../schema/update-category-schema';
import { updateSubcategorySchema } from '../schema/update-subcategory-schema';

@Controller('admin/categories')
@ApiTags('Categories')
@UseGuards(AuthGuard('jwt'))
@UseGuards(RoleGuard(Role.MerovAdmin))
@SerializeOptions({ groups: [MEROV_ADMIN] })
export class AdminCategoriesController {
    private readonly logger = new Logger(AdminCategoriesController.name);

    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    async createCategory(
        @Body(new JoiValidationPipe(createCategorySchema)) createCategoryDto: CreateCategoryDto
    ): Promise<Category> {
        return this.categoriesService.createCategory(createCategoryDto);
    }

    @Post(':categoryId/subcategories')
    async createSubcategory(
        @Param('categoryId') categoryId: string,
        @Body(new JoiValidationPipe(createSubcategorySchema)) createSubcategoryDto
    ): Promise<Subcategory> {
        return this.categoriesService.createSubcategory({ ...createSubcategoryDto , categoryId});
    }

    @Delete(':id')
    async deleteCategory(
        @Param('id') id: string): Promise<void> {
        return this.categoriesService.deleteCategory(id);
    }

    @Delete('/subcategory/:id')
    async deleteSubcategory(
        @Param('id') id: string): Promise<void> {
        return this.categoriesService.deleteSubcategory(id);
    }

    @Patch(':id')
    async updateCategory(
        @Param('id') id: string,
        @Body(new JoiValidationPipe(updateCategorySchema)) createCategoryDto
    ): Promise<Category> {
        return this.categoriesService.updateCategory(id, createCategoryDto);
    }

    @Patch('/subcategory/:id')
    async updateSubcategory(
        @Param('id') id: string,
        @Body(new JoiValidationPipe(updateSubcategorySchema)) createSubcategoryDto
    ): Promise<Subcategory> {
        return this.categoriesService.updateSubcategory(id, createSubcategoryDto);
    }

}
