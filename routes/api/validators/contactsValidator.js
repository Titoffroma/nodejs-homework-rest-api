const Joi = require('joi')

const contactPostSchema = Joi.object({
  name: Joi.string().pattern(new RegExp('^[\\w\\s?\\w]{4,30}$')).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
  phone: Joi.string().pattern(new RegExp('^\\+[\\d]{12}$')),
  favorite: Joi.boolean(),
  owner: Joi.string().required(),
}).and('name', 'email', 'owner')

const contactUpdateSchema = Joi.object({
  name: Joi.string().pattern(new RegExp('^[\\w\\s?\\w]{4,30}$')),
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
  phone: Joi.string().pattern(new RegExp('^\\+[\\d]{12}$')),
  favorite: Joi.boolean(),
}).or('name', 'email', 'phone', 'favorite')

module.exports = { contactPostSchema, contactUpdateSchema }
