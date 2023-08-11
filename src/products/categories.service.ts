

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/services/prisma.service";
import { Category, Subcategory } from "./dto/category";
import { CreateCategoryDto, CreateSubcategoryDto, UpdateCategoryDto, UpdateSubcategoryDto } from "./dto/category.dto";

@Injectable()
export class CategoriesService {
    constructor( 
        private readonly prisma: PrismaService, 
    ) {}

    async createCategory(data: CreateCategoryDto): Promise<Category> {
        const category = await this.prisma.category.create({
            data,
            include: {
                subcategories: true,
            }
        });

        return new Category(category);
    }

    async createSubcategory(data: CreateSubcategoryDto): Promise<Subcategory> {
        const subcategory = await this.prisma.subcategory.create({
            data
        });

        return new Subcategory(subcategory);
    }

    async findCategories(): Promise<Category[]> {
        const categories = await this.prisma.category.findMany({include: { subcategories: true }});
        return categories.map(category => new Category(category));
    }

    async findSubcategories(categoryId: string): Promise<Subcategory[]> {
        const subcategories = await this.prisma.subcategory.findMany({
            where: {
                categoryId,
            }
        });

        return subcategories.map(subcategory => new Subcategory(subcategory));
    }

    async deleteCategory(id: string): Promise<void> {
        await this.prisma.category.delete({
           where: {
               id,
           },
       });
   }
  
   async deleteSubcategory(id: string): Promise<void> {
       await this.prisma.subcategory.delete({
          where: {
              id,
          },
      });
  }
 
  async updateCategory(categoryId: string, data: UpdateCategoryDto): Promise<Category> {
 
        const category = await this.prisma.category.update({
           where: {
               id: categoryId,
           },
           data,
       });
 
       return new Category( category)
   }
 
   async updateSubcategory(subcategoryId: string, data: UpdateSubcategoryDto): Promise<Subcategory> {
 
       const subcategory = await this.prisma.subcategory.update({
          where: {
              id: subcategoryId,
          },
          data,
      });
 
      return new Subcategory(subcategory)
  }

}