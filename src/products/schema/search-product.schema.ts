import * as Joi from 'joi';

export const searchProductsSchema = Joi.object({
  take: Joi.number().integer().min(1).max(50),
  skip: Joi.number().integer().min(0),
  search: Joi.string(),
  maxPrice: Joi.number().integer().min(0),
  minPrice: Joi.number().integer().min(0),
  category: Joi.string(),
  subCategories: Joi.string(),
  brands: Joi.string(),
  models: Joi.string(),
  conditions: Joi.string(),
  currencies: Joi.string(),
  hasStock: Joi.boolean(),
  sort: Joi.array().items(Joi.string())
});
