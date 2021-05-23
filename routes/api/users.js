const express = require('express')
const router = express.Router()
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs').promises
const multer = require('multer')
const gravatar = require('gravatar')
var Jimp = require('jimp')

const uploadDir = path.join(process.cwd(), 'temp')
const storeImage = path.join(process.cwd(), 'public/avatars')

const auth = require('./middlewares/auth')
const { Dbusers } = require('../../model')
const { signupSchema } = require('./validators/usersValidator')

require('dotenv').config()
const secret = process.env.SECRET

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
  limits: {
    fileSize: 1048576,
  },
})

const upload = multer({ storage })

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password } = Joi.attempt(
      req.body,
      signupSchema,
      'Validation failed: ',
    )

    const isInUse = await Dbusers.findOne({ email })

    if (isInUse)
      return res.status(409).json({
        status: 'failure',
        code: 409,
        message: 'Email in use',
      })

    const avatarURL = gravatar.url(email, { s: '250', d: 'identicon' }, true)
    const newUser = new Dbusers({ email, avatarURL })
    newUser.setPassword(password)
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

router.patch(
  '/avatars',
  auth,
  upload.single('avatarURL'),
  async (req, res, next) => {
    try {
      const { _id } = req.user

      const { description } = req.body
      const { path: temporaryName, originalname } = req.file

      const userToUpdate = await Dbusers.findById(_id)

      if (!userToUpdate) {
        return res.status(401).json({
          status: 'error',
          code: 401,
          message: 'Not authorized',
        })
      }

      const filePath = new Date()
        .toLocaleDateString('en-US', {
          timeZone: 'America/Los_Angeles',
        })
        .split('/')
        .reverse()
        .join('/')

      const newName = `${Date.now()}-${originalname}`
      const fileName = path.join(storeImage, filePath, newName)

      const newFile = await Jimp.read(temporaryName)
      newFile.resize(250, 250).quality(60).write(fileName)

      fs.unlink(temporaryName)

      console.log(description)

      userToUpdate.avatarURL = `avatars/${filePath}/${newName}`

      const { avatarURL } = await userToUpdate.save()

      res.status(200).json({
        status: 'success',
        code: 200,
        description,
        message: 'Файл успешно загружен',
        data: {
          avatarURL,
        },
      })
    } catch ({ message }) {
      res.status(400).json({
        status: 'failure',
        code: 400,
        message,
      })
      console.log(`Avatar upload error: ${message}`)
    }
  },
)

module.exports = { usersRouter: router, uploadDir, storeImage }
