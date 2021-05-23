const Joi = require('joi')

const signupSchema = Joi.object({
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
}).and('password', 'email')

module.exports = { signupSchema }
