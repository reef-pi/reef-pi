const fs = require('fs')
const path = require('path')
const PATH_CSV = './assets/translations/'
const PATH_JSON = './jsx/utils/translations/'
const files = fs.readdirSync(PATH_CSV)
function namespaceNesting(o, k, v) {
  let namespace = ''
  let splittedKey = k.split(':')
  let key = ''
  if (splittedKey.length > 1) {
    namespace = splittedKey[0]
    key = splittedKey[1]
  } else {
    key = splittedKey[0]
    namespace = 'common'
  }
  if (!o[namespace]) {
    o[namespace] = {}
  }
  if (splittedKey.length > 2) {
    splittedKey.shift()
    namespaceNesting(o[namespace], splittedKey.join(':'), v)
  } else {
    o[namespace][key] = v
  }
}
function genTsObj(lineArray) {
  let o = {}
  lineArray.forEach(l => {
    let kv = l.split(',')
    namespaceNesting(o, kv[0], kv[1])
  })
  return o
}
files.forEach(f => {
  let lines = fs.readFileSync(`${PATH_CSV}${f}`, 'utf8').match(/[^\r\n]+/g)
  lines.shift() // deleting titles
  fs.writeFileSync(`${PATH_JSON}${path.basename(f, '.csv')}.json`, JSON.stringify(genTsObj(lines)))
})
