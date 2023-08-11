import * as Joi from 'joi';

export const getModelSchema = Joi.object({
    categoryId: Joi.string(),
    subcategoryId: Joi.string(),
    approved: Joi.boolean(),
    brand: Joi.string(),
    sort: Joi.string().valid('name_desc', 'name_asc'),
    take: Joi.number().integer().min(1),
    skip: Joi.number().integer().min(0),
    pagination: Joi.string(),
});