export class SearchProductsDto {
  search?: string;
  category?: string;
  subCategories?: string[];
  currencies?: string[];
  minPrice?: number;
  maxPrice?: number;
  conditions?: string[];
  brands?: string[];
  models?: string[];
  skip?: number;
  take?: number;
  hasStock?: boolean;
  sort?: string[];
}
