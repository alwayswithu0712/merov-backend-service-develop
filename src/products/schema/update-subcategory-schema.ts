import * as Joi from 'joi';

export const updateSubcategorySchema = Joi.object({
    name: Joi.string().required(),
});
