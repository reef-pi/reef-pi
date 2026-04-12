import EntrySchema from './entry_schema'

describe('EntrySchema', () => {
  it('accepts a valid entry', () => {
    expect.assertions(1)
    return EntrySchema.validate({ value: 7.2, comment: 'normal', timestamp: 'Jul-08-23:38, 2022' })
      .then(value => {
        expect(value.value).toBe(7.2)
      })
  })

  it('accepts an entry without comment', () => {
    expect.assertions(1)
    return EntrySchema.validate({ value: 8.1, timestamp: 'Jan-01-10:00, 2023' })
      .then(value => {
        expect(value.value).toBe(8.1)
      })
  })

  it('rejects when value is missing', () => {
    expect.assertions(1)
    return EntrySchema.validate({ comment: 'test', timestamp: 'Jul-08-23:38, 2022' })
      .catch(err => {
        expect(err.message).toBeTruthy()
      })
  })

  it('rejects when timestamp is missing', () => {
    expect.assertions(1)
    return EntrySchema.validate({ value: 7.2, comment: 'test' })
      .catch(err => {
        expect(err.message).toBeTruthy()
      })
  })

  it('rejects non-numeric value', () => {
    expect.assertions(1)
    return EntrySchema.validate({ value: 'not-a-number', timestamp: 'Jul-08-23:38, 2022' })
      .catch(err => {
        expect(err.message).toBeTruthy()
      })
  })
})
