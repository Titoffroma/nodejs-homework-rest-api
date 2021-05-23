const mongoose = require('mongoose')

const contactsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
    minLength: [4, 'The name value must be between 5 and 30 characters'],
    maxLength: [30, 'The name value must be between 5 and 30 characters'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
})

module.exports = contactsSchema
