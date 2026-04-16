const path = require('path')

const authDir = path.join(__dirname, '..', '.auth')
const authFile = path.join(authDir, 'user.json')

module.exports = {
  authDir,
  authFile
}
