import * as Joi from 'joi';

export const updateBrandSchema = Joi.object({
    approved: Joi.boolean().required(),
});
