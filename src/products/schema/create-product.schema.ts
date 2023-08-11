import { Blockchain, Currency } from '../../shared/typings';
import * as Joi from 'joi';

import * as validator from 'multicoin-address-validator';
import { DimensionUnits, WeightUnits } from 'src/shared/typings/units';

const addressValidator = (value: any, helper: any) => {
    const blockchain = helper.state.ancestors[0].chain;

    if (blockchain === Blockchain.Polygon) {
        return validator.validate(value, 'matic');
    } else {
        return validator.validate(value, blockchain);
    }
};

export const createProductSchema = Joi.object({
    title: Joi.string().min(5).required(),
    description: Joi.string().min(5),
    price: Joi.number().positive().required(),
    chain: Joi.string().valid(...Object.values(Blockchain)).required(),
    currency: Joi.string().valid(...Object.values(Currency)).required(),
    stock: Joi.number().integer().min(1).required(),
    condition: Joi.string().min(3).required(),
    categoryId: Joi.string().required(),
    subcategoryId: Joi.string().required(),
    images: Joi.array().items(Joi.string()),
    sellerAddress: Joi.string().required().custom(addressValidator),

    deliveryAddressId: Joi.string().required(),

    weight: Joi.number().positive(),
    length: Joi.number().positive(),
    width: Joi.number().positive(),
    height: Joi.number().positive(),
    weightUnit: Joi.string().valid(...WeightUnits),
    dimensionsUnit: Joi.string().valid(...DimensionUnits),

    maxTestingTime:  Joi.number().integer(),
    minTestingTime:  Joi.number().integer(),
    brand: Joi.string(),
    model: Joi.string(),
    published: Joi.boolean(),
});
