import * as Joi from 'joi';

export const createOrganizationSchema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    taxId: Joi.string().required(),
    website: Joi.string().required(),
});
