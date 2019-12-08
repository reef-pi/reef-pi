const fs = require('fs')
const args = process.argv.slice(2)
const PATH_CSV = './front-end/assets/translations/'
const files = fs.readdirSync(PATH_CSV)
const masterFile = 'en.csv'
const generate = require('csv-generate')
const stringify = require('csv-stringify')
const parse = require('csv-parse/lib/sync')

function readMasterFile() {
  return readTranslation(masterFile)
}

function readTranslation(filename) {
  const source = fs.readFileSync(`${PATH_CSV}${filename}`, 'utf8')
  const records = parse(source, {
    columns: true,
    skip_empty_lines: true
  })
  return records
}

function updateMissingTranslation(masterLine, slaveArray) {
  const masterKey = masterLine.split(',')[0]
  const sK = slaveArray.find(s => masterKey === s.split(',')[0])
  if (!sK) {
    slaveArray.push(`${masterKey},`)
  }
}

function deleteDeprecatedTranslations(slaveLine, masterArray) {
  const slaveKey = slaveLine.split(',')[0]
  const found = masterArray.find(s => slaveKey === s.split(',')[0])
  if (!found) {
    console.log(`Deprecated key: ${slaveKey}`)
    slaveLine = ''
  }
  return slaveLine
}

function syncTranslationFiles(masterTranslations) {
  files.forEach(f => {
    if (f !== masterFile) {
      let slave = fs.readFileSync(`${PATH_CSV}${f}`, 'utf8')
      const records = parse(slave, {
        columns: true,
        skip_empty_lines: true
      })
      masterTranslations.forEach(t => {
        updateMissingTranslation(t, records)
      })
      for (const prop in records) {
        records[prop] = deleteDeprecatedTranslations(records[prop], masterTranslations)
      }
      generate({})
      fs.writeFileSync(`${PATH_CSV}${f}`, csvOutput)
    }
  })
}

function checkTranslationFiles(masterTranslations) {
  let errors = {}
  files
    .filter(f => f !== masterFile)
    .forEach(f => {
      const slaveTranslations = readTranslation(f)
      const slaveKeys = slaveTranslations.map(s => {
        if (s.Translation) {
          return s.Key
        }
      })
      const missingTranslations = masterTranslations.filter(t => !slaveKeys.includes(t.Key))
      if (missingTranslations.length > 0) {
        errors[f] = missingTranslations.map(s => s.Key)
      }
    })
  if (Object.keys(errors).length > 0) {
    console.log('Missing translations found')
    console.log('')
    Object.keys(errors).forEach(e => {
      console.log(`Missing translations in ${e}`)
      console.log('')
      console.log(errors[e].join('\n'))
      console.log('')
    })
    console.log('Translation report:')
    Object.keys(errors).forEach(e => {
      console.log(`${e} : ${errors[e].length} entries missing`)
    })
    return false
  } else {
    console.log('Everything is synchronised')
    return true
  }
}

function main() {
  const master = readMasterFile()
  switch (args[0]) {
    case 'sync':
      syncTranslationFiles(master)
      break
    case 'ci':
      if (checkTranslationFiles(master)) {
        process.exit(0)
      } else {
        process.exit(1)
      }
      break
    default:
      console.log('Invalid argument. sync / ci are only available')
      process.exit(1)
  }
}

main()
