import React from 'react'
import Main, { RawATOMain } from './main'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockImplementation(() => Promise.resolve(true))
}))

const ato = {
  id: '1', name: 'Top-off', enable: true,
  inlet: 'inlet1', period: 60, debounce: 0,
  control: true, pump: { id: 'pump1' },
  sensor: { readings: [] }
}
const equipment = [{ id: 'pump1', name: 'ATO Pump' }]
const inlets = [{ id: 'inlet1', name: 'Float Switch' }]
const macros = []

const storeState = { atos: [ato], equipment, inlets, macros }

describe('ATO Main', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('smoke test via Provider shallow', () => {
    const main = new RawATOMain({
      atos: [ato],
      equipment,
      inlets,
      macros,
      fetchATOs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchInlets: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      reset: jest.fn()
    })
    expect(main.render().type).toBe('div')
    expect(Main).toBeDefined()
  })

  it('mounts with ATO list', () => {
    const main = new RawATOMain({
      atos: [ato],
      equipment,
      inlets,
      macros,
      fetchATOs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchInlets: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      reset: jest.fn()
    })
    expect(main.probeList()).toHaveLength(1)
  })

  it('mounts with empty ATO list', () => {
    const main = new RawATOMain({
      atos: [],
      equipment: [],
      inlets: [],
      macros: [],
      fetchATOs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchInlets: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      reset: jest.fn()
    })
    expect(main.probeList()).toHaveLength(0)
  })

  it('renders New sub-component for adding ATOs', () => {
    const main = new RawATOMain({
      atos: [ato],
      equipment,
      inlets,
      macros,
      fetchATOs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchInlets: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      reset: jest.fn()
    })
    const rendered = main.render()
    expect(rendered.props.children.props.className).toBe('list-group list-group-flush')
  })
})
