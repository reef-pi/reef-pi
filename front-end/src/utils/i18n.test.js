import i18n from './i18n'

describe('i18n', () => {
  it('loads without throwing', () => {
    expect(i18n).toBeDefined()
  })

  it('has a t function', () => {
    expect(typeof i18n.t).toBe('function')
  })

  it('returns a string for translation keys', () => {
    const result = i18n.t('save_successful')
    expect(typeof result).toBe('string')
  })
})
