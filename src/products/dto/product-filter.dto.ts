export interface ProductFilter {
    price?: {
        min?: number;
        max?: number;
    },
    categoryIds?: string;
    subcategoryIds?: string;
    brands?: string;
    models?: string;
    conditions?: string;
    currencies?: string;
}