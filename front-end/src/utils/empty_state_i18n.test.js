import fs from 'fs'
import path from 'path'

// Every EmptyState title, body and action label must go through i18n (#3315): a string literal there
// can never be translated, and `translations:sync` would never know the key exists.
const SRC = path.resolve(__dirname, '..')

const sourceFiles = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name)
  if (entry.isDirectory()) return sourceFiles(full)
  return /\.jsx$/.test(entry.name) && !/\.test\./.test(entry.name) ? [full] : []
})

const emptyStateBlocks = source => source.match(/<EmptyState\b[\s\S]*?\/>/g) || []

// title='…' / body="…" and `label: '…'` are literals; title={i18n.t(…)} and label: i18n.t(…) are not.
const LITERAL_PROP = /\b(?:title|body)=(['"])/
const LITERAL_LABEL = /\blabel:\s*(['"`])/

describe('EmptyState copy is translatable (#3315)', () => {
  const files = sourceFiles(SRC)

  it('finds the list pages that render an EmptyState', () => {
    const using = files.filter(file => emptyStateBlocks(fs.readFileSync(file, 'utf8')).length > 0)
    expect(using.length).toBeGreaterThanOrEqual(9)
  })

  it('has no string-literal title, body or action label', () => {
    const offenders = []
    files.forEach(file => {
      emptyStateBlocks(fs.readFileSync(file, 'utf8')).forEach(block => {
        if (LITERAL_PROP.test(block) || LITERAL_LABEL.test(block)) {
          offenders.push(path.relative(SRC, file))
        }
      })
    })
    expect(offenders).toEqual([])
  })

  it('catches a literal when one is introduced', () => {
    expect(LITERAL_PROP.test("<EmptyState title='No things yet' />")).toBe(true)
    expect(LITERAL_LABEL.test("action={{ label: 'Add thing' }}")).toBe(true)
    expect(LITERAL_PROP.test("<EmptyState title={i18n.t('a:b', { defaultValue: 'No things yet' })} />")).toBe(false)
    expect(LITERAL_LABEL.test("action={{ label: i18n.t('a:c', { defaultValue: 'Add thing' }) }}")).toBe(false)
  })
})
