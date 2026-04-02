import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^(2|4|5|7|9)\d{7}$/)
    .required()
    .messages({ 'string.pattern.base': 'Phone must be a valid Tunisian number (8 digits, starts with 2/4/5/7/9)' }),
  password: Joi.string().pattern(/^(?=.*[0-9]).{8,}$/).required().messages({ 'string.pattern.base': 'Password must be at least 8 characters and contain at least 1 number' }),
  city: Joi.string().max(100).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
