import * as Joi from 'joi';

export const getProductsSchema = Joi.object({
    take: Joi.number().integer().min(1).max(50),
    skip: Joi.number().integer().min(0),
    sort: Joi.string().valid('price_desc', 'price_asc', 'created_desc', 'created_asc', 'name_desc', 'name_asc'),

    pagination: Joi.string(),

    minPrice: Joi.number().integer().min(0),
    maxPrice: Joi.number().integer().min(0),
    categoryIds: Joi.string(),
    subcategoryIds: Joi.string(),
    brands: Joi.string(),
    models: Joi.string(),
    conditions: Joi.string(),
    currencies: Joi.string(),
    hasStock: Joi.boolean(),
    featured: Joi.boolean(),
    sellerId: Joi.string(),
    published: Joi.boolean(),
});
