const nodemailer = require('nodemailer')
const { nanoid } = require('nanoid')
const Joi = require('joi')

const { Dbusers } = require('../../../model')
const { authSchema } = require('../validators/usersValidator')

async function main(mail, token) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'titoff.roma',
      pass: process.env.PATHWORD,
    },
  })

  let info = await transporter.sendMail({
    from: '"Pnonebook" <titoff_roma@mail.ru>',
    to: mail,
    subject: 'Email confirmation',
    text: 'Please, click the link bellow to confirm your email',
    html: `<div style="background: blue; padding: 40px;">
    <a href="http://localhost:3001/api/users/verify/${token}" target="_blank" style="color:white;">
    Please, click the link to confirm your email</a></div>`,
  })

  console.log('Message sent: %s', info.messageId)
}

const sendMail = async (req, res, next) => {
  const { verifyToken = null } = req.params
  const { email = null } = req.body
  const token = nanoid()
  try {
    if (verifyToken) {
      const vaitingVerification = await Dbusers.findOne({ verifyToken })
      if (vaitingVerification.verify)
        return res.status(400).json({
          status: 'failure',
          code: 400,
          message: 'Verification has already been passed',
        })
      email && (await main(email, verifyToken))
      req.verifyToken = verifyToken
      return next()
    }

    const isInUse = await Dbusers.findOne({ email })

    if (isInUse && isInUse.verifyToken) {
      if (isInUse.verify)
        return res.status(400).json({
          status: 'failure',
          code: 400,
          message: 'Verification has already been passed',
        })
      await main(email, isInUse.verifyToken)
      req.verifyToken = token
      return next()
    }
    if (!verifyToken && isInUse)
      return res.status(409).json({
        status: 'failure',
        code: 409,
        message: 'Email in use',
      })
    else {
      Joi.attempt({ email }, authSchema, 'Validation failed: ')
      await main(email, token)
      req.verifyToken = token
      next()
    }
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports = sendMail
