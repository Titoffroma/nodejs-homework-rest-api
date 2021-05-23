const express = require('express')
const Joi = require('joi')

const router = express.Router()

const { Dbcontacts } = require('../../model')
const {
  contactPostSchema,
  contactUpdateSchema,
} = require('./validators/contactsValidator')
const auth = require('./middlewares/auth')

router.get('/', auth, async (req, res, next) => {
  try {
    const { _id } = req.user
    const data = await Dbcontacts.find({ owner: _id })
    if (data) {
      res.status(200).json({
        status: 'success',
        code: 200,
        data,
      })
    } else
      res.status(404).json({
        status: 'failure',
        code: 404,
        message: 'Not found',
      })
  } catch ({ message }) {
    res.status(400).json({
      status: 'failure',
      code: 400,
      message,
    })
    console.log(`Query error: ${message}`)
  }
})

router.get('/:contactId', auth, async (req, res, next) => {
  try {
    const { contactId } = req.params
    const { _id } = req.user
    const data = await Dbcontacts.findById(contactId)
    if (data) {
      if (`${data.owner}` !== `${_id}`)
        return res.status(404).json({
          status: 'failure',
          code: 404,
          message: 'Not found',
        })
      res.status(200).json({
        status: 'success',
        code: 200,
        data,
      })
    } else
      res.status(404).json({
        status: 'failure',
        code: 404,
        message: 'Not found',
      })
  } catch ({ message }) {
    res.status(400).json({
      status: 'failure',
      code: 400,
      message,
    })
    console.log(`Query error: ${message}`)
  }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const authBody = Object.assign(req.body, { owner: `${req.user._id}` })
    const validBody = Joi.attempt(
      authBody,
      contactPostSchema,
      'Validation failed: ',
    )
    const newContact = new Dbcontacts(validBody)
    const data = await newContact.save()
    if (data) {
      res.status(201).json({
        status: 'success',
        code: 201,
        data,
      })
    }
  } catch ({ message }) {
    res.status(400).json({
      status: 'failure',
      code: 400,
      message,
    })
    console.log(`Post error: ${message}`)
  }
})

router.delete('/:contactId', auth, async (req, res, next) => {
  try {
    const { contactId } = req.params
    const { _id } = req.user
    const data = await Dbcontacts.findByIdAndRemove(contactId)
    if (data) {
      if (`${data.owner}` !== `${_id}`)
        return res.status(404).json({
          status: 'failure',
          code: 404,
          message: 'Not found',
        })
      res.status(200).json({
        status: 'success',
        code: 200,
        data,
      })
    } else
      res.status(404).json({
        status: 'failure',
        code: 404,
        message: 'Not found',
      })
  } catch ({ message }) {
    res.status(400).json({
      status: 'failure',
      code: 400,
      message,
    })
    console.log(`Deletion error: ${message}`)
  }
})

router.patch('/:contactId', auth, async (req, res, next) => {
  try {
    const validBody = Joi.attempt(
      req.body,
      contactUpdateSchema,
      'Validation failed: ',
    )
    const { contactId } = req.params
    const { _id } = req.user

    const data = await Dbcontacts.findOneAndUpdate(
      { _id: contactId, owner: _id },
      validBody,
      {
        new: true,
        runValidators: true,
      },
    )

    if (data) {
      res.status(200).json({
        status: 'success',
        code: 200,
        data,
      })
    } else
      res.status(404).json({
        status: 'failure',
        code: 404,
        message: 'Not found',
      })
  } catch ({ message }) {
    res.status(400).json({
      status: 'failure',
      code: 400,
      message,
    })
    console.log(`Update error: ${message}`)
  }
})

router.patch('/:contactId/favorite', auth, async (req, res, next) => {
  try {
    const { contactId } = req.params
    const { body } = req
    const { _id } = req.user

    if (!body || !('favorite' in body))
      return res.status(404).json({
        status: 'failure',
        code: 400,
        message: 'missing field favorite',
      })

    const data = await Dbcontacts.findOneAndUpdate(
      { _id: contactId, owner: _id },
      { favorite: body.favorite },
      {
        new: true,
        runValidators: true,
      },
    )

    if (data) {
      res.status(200).json({
        status: 'success',
        code: 200,
        data,
      })
    } else
      res.status(404).json({
        status: 'failure',
        code: 404,
        message: 'Not found',
      })
  } catch ({ message }) {
    res.status(400).json({
      status: 'failure',
      code: 400,
      message,
    })
    console.log(`Update error: ${message}`)
  }
})

module.exports = router
