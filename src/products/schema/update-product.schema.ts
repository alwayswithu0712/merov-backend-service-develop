import { Blockchain, Currency } from '../../shared/typings';
import * as Joi from 'joi';
import * as validator from 'multicoin-address-validator';
import { DimensionUnits, WeightUnits } from '../../shared/typings/units';

const addressValidator = (value: any, helper: any) => {
    const blockchain = helper.state.ancestors[0].chain;
    if (blockchain === Blockchain.Polygon) {
        return validator.validate(value, 'matic');
    } else {
        return validator.validate(value, blockchain);
    }
};

export const updateProductSchema = Joi.object({
    title: Joi.string().min(5),
    description: Joi.string().min(5),
    price: Joi.number().positive(),
    chain: Joi.string()
        .valid(...Object.values(Blockchain)),
    currency: Joi.string()
        .valid(...Object.values(Currency)),
    stock: Joi.number().integer(),
    condition: Joi.string().min(3),
    categoryId: Joi.string(),
    subcategoryId: Joi.string(),
    sellerAddress: Joi.string().custom(addressValidator),
    images: Joi.array().items(Joi.string()),
    maxTestingTime:  Joi.number().integer(),
    minTestingTime:  Joi.number().integer(),

    deliveryAddressId: Joi.string(),

    weight: Joi.number().positive(),
    length: Joi.number().positive(),
    width: Joi.number().positive(),
    height: Joi.number().positive(),
    weightUnit: Joi.string().valid(...WeightUnits),
    dimensionsUnit: Joi.string().valid(...DimensionUnits),

    brand:  Joi.string(),
    model:  Joi.string(),
    featured: Joi.boolean(),
    published: Joi.boolean(),
    approved: Joi.boolean(),
});
