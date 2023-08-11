export interface CreateCategoryDto {
    name: string;
}

export interface CreateSubcategoryDto {
    categoryId: string;
    name: string;
}

export interface UpdateCategoryDto {
    name: string;
}

export interface UpdateSubcategoryDto {
    name: string;
}
