import * as Joi from 'joi';

export const createBrandSchema = Joi.object({
    name: Joi.string().required(),
    categoryId: Joi.string().required(),
    subcategoryId: Joi.string().required(),
    approved: Joi.boolean(),
});
