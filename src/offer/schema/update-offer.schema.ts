import { OfferStatus } from '@prisma/client';
import * as Joi from 'joi';

export const updateOfferSchema = Joi.object({
    status: Joi.string().required().valid(OfferStatus.Closed),
});
