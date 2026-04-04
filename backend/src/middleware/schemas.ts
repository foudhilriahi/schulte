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

export const adminCreateHRSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^(?=.*[0-9]).{8,}$/).required().messages({
    'string.pattern.base': 'Password must be at least 8 characters and contain at least 1 number',
  }),
  phone: Joi.string().allow('', null).optional(),
  site: Joi.string().valid('bouarada', 'zaghouan', 'Bouarada', 'Zaghouan').required(),
});

export const adminUpdateHRSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().allow('', null).optional(),
  site: Joi.string().valid('bouarada', 'zaghouan', 'Bouarada', 'Zaghouan').optional(),
  password: Joi.string().pattern(/^(?=.*[0-9]).{8,}$/).optional().messages({
    'string.pattern.base': 'Password must be at least 8 characters and contain at least 1 number',
  }),
}).min(1);

export const adminCreateTemplateSchema = Joi.object({
  titleFr: Joi.string().min(2).max(200).required(),
  titleEn: Joi.string().min(2).max(200).required(),
  contractType: Joi.string().valid('CDI', 'CDD', 'Stage', 'Alternance').required(),
  department: Joi.string().min(2).max(120).required(),
  description: Joi.string().min(10).max(3000).required(),
  suggestedSkills: Joi.array().items(Joi.string().trim().min(1).max(80)).max(30).required(),
});

export const adminUpdateTemplateSchema = Joi.object({
  titleFr: Joi.string().min(2).max(200).optional(),
  titleEn: Joi.string().min(2).max(200).optional(),
  contractType: Joi.string().valid('CDI', 'CDD', 'Stage', 'Alternance').optional(),
  department: Joi.string().min(2).max(120).optional(),
  description: Joi.string().min(10).max(3000).optional(),
  suggestedSkills: Joi.array().items(Joi.string().trim().min(1).max(80)).max(30).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const profileUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
});

export const profilePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().pattern(/^(?=.*[0-9]).{8,}$/).required().messages({
    'string.pattern.base': 'Password must be at least 8 characters and contain at least 1 number',
  }),
});

export const adminBroadcastSchema = Joi.object({
  message: Joi.string().trim().min(3).max(500).required(),
  site: Joi.string().valid('Bouarada', 'Zaghouan').optional(),
});
