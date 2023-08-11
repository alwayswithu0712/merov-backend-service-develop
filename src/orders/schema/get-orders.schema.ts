import * as Joi from 'joi';

export const getOrdersSchema = Joi.object({
    take: Joi.number().integer().min(1).max(50),
    skip: Joi.number().integer().min(0),
    sort: Joi.string().valid('created_desc', 'created_asc', 'name_desc', 'name_asc'),
    pagination: Joi.string(),
    condition: Joi.string().valid('buyer', 'seller'),
});
