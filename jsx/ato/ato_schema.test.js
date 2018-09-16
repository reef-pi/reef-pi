import AtoSchema from './ato_schema'

describe('Validation', () => {
  var ato = {
    name: 'name',
    enable: true,
    control: false,
    inlet: '2',
    period: 60,
    pump: 3,
    notify: false,
    maxAlert: ''
  }

  beforeEach(() => {
    ato = {
      name: 'name',
      enable: true,
      control: false,
      inlet: '2',
      period: 60,
      pump: 3,
      notify: false,
      maxAlert: ''
    }
  })

  it('should require maxAlert when notify is enabled', () => {
    ato.notify = true
    expect.assertions(1)
    return AtoSchema.isValid(ato).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should not require maxAlert when notify is enabled', () => {
    ato.notify = false
    ato.maxAlert = null
    expect.assertions(1)
    AtoSchema.validateSync(ato)
    return AtoSchema.isValid(ato).then(
      valid => expect(valid).toBe(true)
    )
  })
})
