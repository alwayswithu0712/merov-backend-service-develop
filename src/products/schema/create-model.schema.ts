import * as Joi from 'joi';

export const createModelSchema = Joi.object({
    name: Joi.string().required(),
    categoryId: Joi.string().required(),
    subcategoryId: Joi.string().required(),
    brand: Joi.string().required(),
    approved: Joi.boolean(),
});
