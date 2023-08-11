import * as Joi from 'joi';

export const createSubcategorySchema = Joi.object({
    name: Joi.string().required(),
});
