import React from 'react'
import { RawDashboardMain, equipmentStripItems } from './main'
import ConfiguredGrid from './configured_grid'

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
    const element = new RawDashboardMain({ equipment: [{ id: '1', name: 'Eq1', on: true }], updateEquipment: jest.fn() }).render()
    expect(element.props.equipment).toEqual([expect.objectContaining({ id: '1', state: 'on' })])
  })
})

describe('<RawDashboardMain /> configured grid', () => {
  const config = { row: 1, column: 1, width: 500, height: 300, grid_details: [[{ type: 'health', id: 'current' }]] }
  const props = extra => ({ updateEquipment: jest.fn(), fetchDashboard: jest.fn(), ...extra })

  it('loads the dashboard config on mount', () => {
    const p = props()
    new RawDashboardMain(p).componentDidMount()
    expect(p.fetchDashboard).toHaveBeenCalledTimes(1)
  })

  it('renders the configured grid inside the dashboard', () => {
    const element = new RawDashboardMain(props({ config })).render()
    expect(element.props.children.type).toBe(ConfiguredGrid)
    expect(element.props.children.props.config).toBe(config)
  })

  it('reloads the config when leaving Configure so saved changes show up', () => {
    const p = props({ config })
    const component = new RawDashboardMain(p)
    component.setState = update => { component.state = { ...component.state, ...update } }

    component.handleToggle()
    expect(component.state.showConfig).toBe(true)
    expect(p.fetchDashboard).not.toHaveBeenCalled()

    component.handleToggle()
    expect(component.state.showConfig).toBe(false)
    expect(p.fetchDashboard).toHaveBeenCalledTimes(1)
  })
})
