import * as Joi from 'joi';

export const configSchema = Joi.object({
    NODE_ENV: Joi.string().valid('develop', 'production', 'test').default('develop'),
    PORT: Joi.number().default(3002),
});
