const fs = require('fs')
const PATH_CSV = './front-end/assets/translations/'
const files = fs.readdirSync(PATH_CSV)
const masterFile = 'en.csv'
const MasterTranslations = fs.readFileSync(`${PATH_CSV}${masterFile}`, 'utf8').match(/[^\r\n]+/g)
MasterTranslations.shift()
function updateMissingTranslation(masterLine, slaveArray) {
  let masterKey = masterLine.split(',')[0]
  let sK = slaveArray.find(s => masterKey === s.split(',')[0])
  if (!sK) {
    slaveArray.push(`${masterKey},`)
  }
}
function deleteDeprecatedTranslations(slaveLine, masterArray) {
  let slaveKey = slaveLine.split(',')[0]
  let found = masterArray.find(s => slaveKey === s.split(',')[0])
  if (!found) {
    console.log(`Deprecated key: ${slaveKey}`)
    slaveLine = ''
  }
  return slaveLine
}
files.forEach(f => {
  if (f !== masterFile) {
    let slave = fs.readFileSync(`${PATH_CSV}${f}`, 'utf8').match(/[^\r\n]+/g)
    slave.shift()
    MasterTranslations.forEach(t => {
      updateMissingTranslation(t, slave)
    })
    for (let i = 0; i < slave.length; i++) {
      slave[i]= deleteDeprecatedTranslations(slave[i], MasterTranslations)
    }
    slave.unshift('Key,Translation')
    let csvOutput = slave.join('\r\n')
    fs.writeFileSync(`${PATH_CSV}${f}`, csvOutput)
  }
})
