import React from 'react'
import { RawDashboardMain, equipmentStripItems, mapStateToProps } from './main'

describe('equipmentStripItems', () => {
  it('maps the API on flag to the strip switch state', () => {
    const items = equipmentStripItems([
      { id: '1', name: 'Eq1', on: true, outlet: '3' },
      { id: '2', name: 'Eq2', on: false, outlet: '4' }
    ])
    expect(items.map(item => [item.id, item.name, item.state])).toEqual([
      ['1', 'Eq1', 'on'],
      ['2', 'Eq2', 'off']
    ])
  })

  it('tolerates a missing equipment list', () => {
    expect(equipmentStripItems(undefined)).toEqual([])
  })
})

describe('<RawDashboardMain />', () => {
  it('hands the dashboard strip items carrying their on/off state', () => {
    const capabilities = { temperature: true, ph: false, ato: true, equipment: true }
    const element = new RawDashboardMain({ capabilities, equipment: [{ id: '1', name: 'Eq1', on: true }], updateEquipment: jest.fn() }).render()
    expect(element.props.equipment).toEqual([expect.objectContaining({ id: '1', state: 'on' })])
    expect(element.props.capabilities).toBe(capabilities)
  })

  it('maps only dashboard setup capabilities from Redux state', () => {
    expect(mapStateToProps({
      capabilities: { temperature: true, ph: false, ato: true, equipment: false, dev_mode: true },
      equipment: [],
      tcs: [],
      phprobes: [],
      atos: []
    }).capabilities).toEqual({
      temperature: true,
      ph: false,
      ato: true,
      equipment: false
    })
  })
})
