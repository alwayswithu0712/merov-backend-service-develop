import * as Joi from 'joi';

export const createBlogPostSchema = Joi.object({
    title: Joi.string().min(5).required(),
    description: Joi.string().min(5).required(),
    images: Joi.array().items(Joi.string()).required(),
});