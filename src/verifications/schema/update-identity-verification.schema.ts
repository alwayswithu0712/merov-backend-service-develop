import * as Joi from 'joi';

export const updateIdentityVerificationSchema = Joi.object({
    status: Joi.string(),
});
