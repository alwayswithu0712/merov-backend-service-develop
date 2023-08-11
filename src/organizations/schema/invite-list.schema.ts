import { Permission, DEFAULT_PERMISSIONS } from '../../shared/typings/permissions'
import * as Joi from 'joi';

const permissionSchema = Joi.string().valid(...Object.values(Permission));

export const inviteSchema = Joi.object({
    email: Joi.string().required(),
    permissions: Joi.array().items(permissionSchema).optional().empty(Joi.array().length(0))
})

export const inviteListSchema = Joi.array().items(inviteSchema).min(1);
