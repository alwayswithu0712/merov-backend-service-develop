import * as Joi from 'joi';

export const getBrandSchema = Joi.object({
    categoryId: Joi.string(),
    subcategoryId: Joi.string(),
    approved: Joi.boolean(),
    sort: Joi.string().valid('name_desc', 'name_asc'),
    take: Joi.number().integer().min(1),
    skip: Joi.number().integer().min(0),
    pagination: Joi.string(),
});