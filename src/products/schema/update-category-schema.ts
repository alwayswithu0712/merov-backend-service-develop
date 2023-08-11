import * as Joi from 'joi';

export const updateCategorySchema = Joi.object({
    name: Joi.string().required(),
});
