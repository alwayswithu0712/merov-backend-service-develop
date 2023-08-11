import * as Joi from 'joi';

export const createReviewSchema = Joi.object({
    rating: Joi.number().required().min(1).max(5),
    review: Joi.string().required().max(140),
});
