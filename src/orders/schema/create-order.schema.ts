import * as Joi from 'joi';

export const createOrderSchema = Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().required().min(1),
    deliveryAddressId: Joi.string().required(),
    offerId: Joi.string(),
}).or('offerId', 'productId');
