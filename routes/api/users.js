const express = require('express')
const router = express.Router()
const Joi = require('joi')
const jwt = require('jsonwebtoken')

const auth = require('./middlewares/auth')
const { Dbusers } = require('../../model')
const { signupSchema } = require('./validators/usersValidator')

require('dotenv').config()
const secret = process.env.SECRET

router.post('/signup', async (req, res, next) => {
  try {
    const validBody = Joi.attempt(req.body, signupSchema, 'Validation failed: ')

    const isInUse = await Dbusers.findOne({ email: validBody.email })

    if (isInUse)
      res.status(409).json({
        status: 'failure',
        code: 409,
        message: 'Email in use',
      })

    const newUser = new Dbusers(validBody)
    newUser.setPassword(validBody.password)
    const user = await newUser.save()
    res.status(201).json({
      status: 'success',
      code: 201,
      user,
    })
  } catch ({ message }) {
    res.status(400).json({
      status: 'failure',
      code: 400,
      message,
    })
    console.log(`Signup error: ${message}`)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = Joi.attempt(
      req.body,
      signupSchema,
      'Validation failed: ',
    )
    const unauthUser = await Dbusers.findOne({ email })

    if (!unauthUser || !unauthUser.validPassword(password)) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Email or password is wrong',
        data: 'Bad request',
      })
    }

    const payload = {
      id: unauthUser.id,
      username: unauthUser.username,
    }

    const token = jwt.sign(payload, secret, { expiresIn: '1h' })

    unauthUser.token = token

    const user = await unauthUser.save()

    res.status(200).json({
      status: 'success',
      code: 200,
      data: {
        token,
        user,
      },
    })
  } catch ({ message }) {
    res.status(400).json({
      status: 'failure',
      code: 400,
      message,
    })
    console.log(`Login error: ${message}`)
  }
})

router.post('/logout', auth, async (req, res, next) => {
  try {
    const { _id } = req.user

    const user = await Dbusers.findByIdAndUpdate(_id, {
      token: null,
    })

    if (!user) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Not authorized',
      })
    }

    res.status(204).json({
      status: 'success',
      code: 204,
    })
  } catch ({ message }) {
    res.status(400).json({
      status: 'failure',
      code: 400,
      message,
    })
    console.log(`Logout error: ${message}`)
  }
})

router.get('/current', auth, async (req, res, next) => {
  try {
    const { _id } = req.user

    const user = await Dbusers.findById(_id)

    if (!user) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Not authorized',
      })
    }

    res.status(200).json({
      status: 'success',
      code: 200,
      data: {
        email: user.email,
        subscription: user.subscription,
      },
    })
  } catch ({ message }) {
    res.status(400).json({
      status: 'failure',
      code: 400,
      message,
    })
    console.log(`Current user error: ${message}`)
  }
})

module.exports = router
