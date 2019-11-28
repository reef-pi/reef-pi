const { genTsObj } = require('./csv-json')

exports.default = function(source) {
  const lines = source.match(/[^\r\n]+/g)
  const output = genTsObj(lines)
  return `export default ${JSON.stringify(output)}`
}
