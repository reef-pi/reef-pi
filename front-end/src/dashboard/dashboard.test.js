import React, { act } from 'react'
import ComponentSelector from './component_selector'
import { RawDashboardConfig } from './config'
import Grid from './grid'
import { RawDashboardMain } from './main'
import 'isomorphic-fetch'

describe('Dashboard', () => {
  const click = (node, event = {}) => {
    act(() => {
      node.props.onClick(event)
    })
  }

  it('<Main /> smoke test via Provider (no config)', () => {
    const props = { config: undefined, fetchDashboard: jest.fn() }
    const component = new RawDashboardMain(props)
    component.componentDidMount()
    expect(props.fetchDashboard).toHaveBeenCalled()
    expect(component.charts()).toBeUndefined()
  })

  it('<Main /> renders with empty grid_details', () => {
    const config = { row: 1, column: 1, width: 400, height: 200 }
    const component = new RawDashboardMain({ config, fetchDashboard: jest.fn() })
    expect(component.charts()).toBeUndefined()
  })

  it('<Main /> renders all chart types (switch coverage)', () => {
    const config = {
      row: 3,
      column: 4,
      width: 400,
      height: 200,
      grid_details: [
        [
          { type: 'lights', id: '1' },
          { type: 'equipment_barchart', id: '1' },
          { type: 'equipment_ctrlpanel', id: '1' },
          { type: 'blank_panel', id: '1' }
        ],
        [
          { type: 'ato', id: '1' },
          { type: 'journal', id: '1' },
          { type: 'ph_current', id: '1' },
          { type: 'ph_historical', id: '1' }
        ],
        [
          { type: 'ph_usage', id: '1' },
          { type: 'doser', id: '1' },
          { type: 'health', id: 'current' },
          { type: 'temp_current', id: '1' }
        ]
      ]
    }
    const component = new RawDashboardMain({ config, fetchDashboard: jest.fn() })
    const rows = component.charts()
    expect(rows).toHaveLength(3)
    expect(rows[0].props.children).toHaveLength(4)
    expect(rows[1].props.children).toHaveLength(4)
    expect(rows[2].props.children).toHaveLength(4)
  })

  it('<Main /> renders temp_historical and default unknown types', () => {
    const config = {
      row: 1,
      column: 2,
      width: 400,
      height: 200,
      grid_details: [
        [{ type: 'temp_historical', id: '1' }, { type: 'unknown_widget', id: '1' }]
      ]
    }
    const component = new RawDashboardMain({ config, fetchDashboard: jest.fn() })
    const rows = component.charts()
    expect(rows).toHaveLength(1)
    expect(rows[0].props.children).toHaveLength(1)
  })

  it('<Main /> handleToggle switches to config view', () => {
    const config = { row: 1, column: 1, width: 400, height: 200, grid_details: [[]] }
    const component = new RawDashboardMain({ config, fetchDashboard: jest.fn() })
    component.setState = update => { component.state = { ...component.state, ...update } }

    click(component.render().props.children.props.children[1].props.children.props.children)
    expect(component.state.showConfig).toBe(true)
  })

  it('<Grid />', () => {
    var cells = [
      [{ id: '1', type: 'light' }, { id: '2', type: 'light' }],
      [{ id: '1', type:'equipment' }, { id: '2',type: 'ato' }],
    ]
    const m = new Grid({ rows: 2, columns: 2, cells, hook: () => {} })
    m.setState = update => { m.state = { ...m.state, ...update } }
    m.setType(0, 0, 'equipment')()
    m.setID(0, 0)('1')
    m.menuItem('ato', true, 0, 1)
    m.render()
  })

  it('<ComponentSelector />', () => {
    const comps = {
      c1: { id: '1', name: 'foo' },
      c2: undefined
    }
    const m = new ComponentSelector({ hook: () => {}, components: comps, current_id: '1' })
    m.setState = update => { m.state = { ...m.state, ...update } }
    m.setID(1, 'foo')({})
  })

  it('<Config />', () => {
    const cells = [[{ type: 'ato', id: '1' }]]
    const config = { row: 1, column: 1, grid_details: cells }
    const m = new RawDashboardConfig({
      config,
      fetchDashboard: jest.fn(),
      updateDashboard: jest.fn(),
      atos: [],
      phs: [],
      tcs: [],
      lights: [],
      dosers: [],
      equips: [],
      journals: [],
      blank: []
    })
    m.state = RawDashboardConfig.getDerivedStateFromProps({ config }, m.state) || { updated: false, config }
    expect(m.render().props.className).toBe('col-12')
  })
})
