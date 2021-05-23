const app = require('../app')
const fs = require('fs').promises

const { uploadDir, storeImage } = require('../routes/api/users')

const isAccessible = path => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false)
}

const createFolderIsNotExist = async folder => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder)
  }
}

const PORT = process.env.PORT || 3000

app.listen(PORT, async () => {
  createFolderIsNotExist(uploadDir)
  createFolderIsNotExist(storeImage)
  console.log(`Server running. Use on port:${PORT}`)
})
