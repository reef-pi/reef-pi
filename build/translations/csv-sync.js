const fs = require('fs')
const PATH_CSV = './assets/translations/'
const files = fs.readdirSync(PATH_CSV)
const masterFile = 'en.csv'
const MasterTranslations = fs.readFileSync(`${PATH_CSV}${masterFile}`, 'utf8').match(/[^\r\n]+/g)
MasterTranslations.shift()
function parseSlaveTranslation(masterLine, slaveArray) {
  let masterKey = masterLine.split(',')[0]
  let sK = slaveArray.find(s => masterKey === s.split(',')[0])
  if (!sK) {
    slaveArray.push(`${masterKey},##`)
  }
}
files.forEach(f => {
  if (f !== masterFile) {
    let slave = fs.readFileSync(`${PATH_CSV}${f}`, 'utf8').match(/[^\r\n]+/g)
    slave.shift()
    MasterTranslations.forEach(t => {
      parseSlaveTranslation(t, slave)
    })
    slave.unshift('Key,Translation')
    let csvOutput = slave.join('\r\n')
    fs.writeFileSync(`${PATH_CSV}${f}`,csvOutput)
  }
})
