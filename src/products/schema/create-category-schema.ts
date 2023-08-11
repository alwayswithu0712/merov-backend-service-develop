import * as Joi from 'joi';

export const createCategorySchema = Joi.object({
    name: Joi.string().required(),
});
