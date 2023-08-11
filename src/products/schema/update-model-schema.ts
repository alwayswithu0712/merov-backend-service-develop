import * as Joi from 'joi';

export const updateModelSchema = Joi.object({
    approved: Joi.boolean().required(),
});
