import JournalSchema from './schema'
import i18n from 'utils/i18n'

describe('JournalSchema', () => {
  it('accepts a valid journal', () => {
    expect.assertions(1)
    return JournalSchema.validate({ name: 'pH Log', description: 'Daily readings', unit: 'pH' })
      .then(value => {
        expect(value.name).toBe('pH Log')
      })
  })

  it('rejects when name is missing', () => {
    expect.assertions(1)
    return JournalSchema.validate({ description: 'test', unit: 'pH' })
      .catch(err => {
        expect(err.message).toBeTruthy()
      })
  })

  it('rejects when description is missing', () => {
    expect.assertions(1)
    return JournalSchema.validate({ name: 'pH Log', unit: 'pH' })
      .catch(err => {
        expect(err.message).toBeTruthy()
      })
  })

  it('requires unit with the entry required validation message', () => {
    expect.assertions(1)
    return JournalSchema.validate({ name: 'pH Log', description: 'Daily readings' })
      .catch(err => {
        expect(err.message).toBe(i18n.t('validation:entry_required'))
      })
  })

  it('rejects an empty object', () => {
    expect.assertions(1)
    return JournalSchema.validate({})
      .catch(err => {
        expect(err.message).toBeTruthy()
      })
  })
})
