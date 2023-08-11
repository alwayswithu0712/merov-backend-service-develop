import * as Joi from 'joi';
import isAdult from '../../shared/helpers/isAdult';

const checkAge = (value, helpers) => {
    if (!isAdult(value)) {
        return helpers.message('Age must be more than 18');
    }
    return value;
};

export const updateUserSchema = Joi.object({
    avatarUrl: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    phone: Joi.string(),
    dateOfBirth: Joi.date().custom(checkAge),
});
