import * as Joi from 'joi';

export const updateAccountAddressSchema = Joi.object({
    name: Joi.string(),
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    postcode: Joi.string(),
    phone: Joi.string(),
});
