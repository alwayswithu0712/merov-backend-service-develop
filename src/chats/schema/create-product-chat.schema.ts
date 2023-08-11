import * as Joi from 'joi';

export const createProductChatSchema = Joi.object({
    productId: Joi.string().required(),
});
