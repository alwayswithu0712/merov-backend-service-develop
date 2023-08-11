import * as Joi from 'joi';

export const createAccountAddressSchema = Joi.object({
    name: Joi.string().required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postcode: Joi.string().required(),
    phone: Joi.string().required(),
});
