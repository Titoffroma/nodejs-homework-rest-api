const express = require('express')

const router = express.Router()

const { Dbcontacts } = require('../../model')

router.get('/', async (req, res, next) => {
  try {
    const data = await Dbcontacts.find({})
    if (data) {
      res.status(200).json({
        status: 'success',
        code: 200,
        data,
      })
    } else throw new Error('Not found')
  } catch ({ message }) {
    res.status(404).json({
      status: 'failure',
      code: 404,
      message,
    })
    console.log(`Query error: ${message}`)
  }
})

router.get('/:contactId', async (req, res, next) => {
  const { contactId } = req.params

  try {
    const data = await Dbcontacts.findById(contactId)
    if (data) {
      res.status(200).json({
        status: 'success',
        code: 200,
        data,
      })
    }
  } catch ({ message }) {
    res.status(404).json({
      status: 'failure',
      code: 404,
      message,
    })
    console.log(`Query error: ${message}`)
  }
})

router.post('/', async (req, res, next) => {
  const { body } = req

  try {
    const newContact = new Dbcontacts(body)
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

router.delete('/:contactId', async (req, res, next) => {
  const { contactId } = req.params

  try {
    const data = await Dbcontacts.findByIdAndRemove(contactId)
    if (data) {
      res.status(200).json({
        status: 'success',
        code: 200,
        data,
      })
    }
  } catch ({ message }) {
    res.status(404).json({
      status: 'failure',
      code: 404,
      message,
    })
    console.log(`Deletion error: ${message}`)
  }
})

router.patch('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params
    const { body } = req

    if (!body || !Object.keys(body).length)
      return res.status(400).json({
        status: 'failure',
        code: 400,
        message: 'missing fields',
      })

    const data = await Dbcontacts.findByIdAndUpdate(contactId, body, {
      new: true,
      runValidators: true,
    })

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
    res.status(404).json({
      status: 'failure',
      code: 404,
      message,
    })
    console.log(`Update error: ${message}`)
  }
})

router.patch('/:contactId/favorite', async (req, res, next) => {
  try {
    const { contactId } = req.params
    const { body } = req

    if (!body || !('favorite' in body))
      return res.status(404).json({
        status: 'failure',
        code: 400,
        message: 'missing field favorite',
      })

    const data = await Dbcontacts.findByIdAndUpdate(
      contactId,
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
    res.status(404).json({
      status: 'failure',
      code: 404,
      message,
    })
    console.log(`Update error: ${message}`)
  }
})

module.exports = router
