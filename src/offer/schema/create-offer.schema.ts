import { Blockchain, Currency } from '../../shared/typings';
import * as Joi from 'joi';
import * as validator from 'multicoin-address-validator';

const addressValidator = (value: any, helper: any) => {
    const blockchain = helper.state.ancestors[0].chain;
    if (blockchain === Blockchain.Polygon) {
        return validator.validate(value, 'matic');
    } else {
        return validator.validate(value, blockchain);
    }
};
export const createOfferSchema = Joi.object({
    chain: Joi.string()
        .valid(...Object.values(Blockchain)).required(),
    currency: Joi.string()
        .valid(...Object.values(Currency)).required(),
    expirationDate: Joi.date(), 
    maxTestingTime: Joi.number().positive(),
    price: Joi.number().positive().required(),
    quantity: Joi.number().integer().required(),
    sellerAddress: Joi.string().custom(addressValidator),
    sharedWith: Joi.string(),
    shippingCost: Joi.number().required(), 
    visibility:  Joi.string().required(),
});
