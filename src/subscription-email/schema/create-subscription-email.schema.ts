import * as Joi from 'joi';

export const createSubscriptionEmailSchema = Joi.object({
    email: Joi.string().email().required(),
    updates: Joi.boolean().required(),
    betaTester: Joi.boolean().required(),
});