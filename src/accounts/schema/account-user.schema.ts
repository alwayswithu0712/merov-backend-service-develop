import * as Joi from 'joi';

export const updateAccountSchema = Joi.object({
    avatarUrl: Joi.string(),
});
