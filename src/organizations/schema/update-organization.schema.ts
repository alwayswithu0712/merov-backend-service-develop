import * as Joi from 'joi';

export const updateOrganizationSchema = Joi.object({
    name: Joi.string(),
    address: Joi.string(),
    taxId: Joi.string(),
    website: Joi.string(),
});
