const mongoose = require('mongoose')

require('dotenv').config()

const uriDb = process.env.DB_HOST

const { userSchema } = require('./Schema')

mongoose.connect(uriDb, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

const db = mongoose.connection

db.on('error', function () {
  console.error.bind(console, 'connection error:')
  process.exit(1)
})

db.once('open', function () {
  console.log('Database connection successful')
})

const Dbcontacts = db.model('Contacts', userSchema, 'contacts')

module.exports = { Dbcontacts }
