import * as Joi from 'joi';

export const updateOrderSchema = Joi.object({
    trackingNumber: Joi.string(),
    maxShippingDurationInDays: Joi.number().min(0),
    maxTimeToDisputeInDays: Joi.number().min(0),
    shippingCost: Joi.number().min(0),
    sellerNotes: Joi.string().min(0).max(140).allow(''),
    disputeReason: Joi.string().max(140),
    status: Joi.string().required(),
});
