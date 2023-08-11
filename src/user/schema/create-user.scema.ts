import * as Joi from 'joi';

export const createUserSchema = Joi.object({
    authId: Joi.string().required(),
    accountId: Joi.string(),
    userId: Joi.string(),
    referral: Joi.string().allow(null),
    email: Joi.string().required(),
    name: Joi.string().required(),
    invitation: Joi.string().allow(null),
    organization: Joi.object()
        .keys({
            name: Joi.string().required(),
            taxId: Joi.string().required(),
            address: Joi.string().required(),
            website: Joi.string().required(),
        })
        .allow(null),
});
