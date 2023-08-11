import * as Joi from 'joi';

export const createContactFormSchema = Joi.object({
    reason : Joi.required(),
    name : Joi.required(),
    email: Joi.string().email().required(),
    description: Joi.required(),
});