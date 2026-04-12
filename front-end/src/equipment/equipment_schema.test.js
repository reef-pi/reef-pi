import EquipmentSchema from './equipment_schema'

describe('EquipmentSchema', () => {
  const valid = { name: 'Return Pump', outlet: '1', stay_off_on_boot: false }

  it('accepts a valid equipment object', () => {
    expect.assertions(1)
    return EquipmentSchema.validate(valid).then(v => {
      expect(v.name).toBe('Return Pump')
    })
  })

  it('rejects missing name', () => {
    expect.assertions(1)
    const bad = { outlet: '1' }
    return EquipmentSchema.validate(bad).catch(err => {
      expect(err.errors.length).toBeGreaterThan(0)
    })
  })

  it('rejects missing outlet', () => {
    expect.assertions(1)
    const bad = { name: 'Pump' }
    return EquipmentSchema.validate(bad).catch(err => {
      expect(err.errors.length).toBeGreaterThan(0)
    })
  })

  it('defaults stay_off_on_boot to false', () => {
    expect.assertions(1)
    const obj = { name: 'Pump', outlet: '1' }
    return EquipmentSchema.validate(obj).then(v => {
      expect(v.stay_off_on_boot).toBe(false)
    })
  })
})
