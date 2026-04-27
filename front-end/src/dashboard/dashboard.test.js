import React from 'react'
import ComponentSelector from './component_selector'
import Config, { RawConfig } from './config'
import Grid from './grid'
import Main, { RawDashboard } from './main'
import EquipmentChart from 'equipment/chart'
import EquipmentCtrlPanel from 'equipment/ctrl_panel'
import BlankPanel from 'dashboard/blank_panel'
import JournalChart from 'journal/chart'
import GenericLightChart from 'lighting/charts/generic'
import ATOChart from 'ato/chart'
import DoserChart from 'doser/chart'
import HealthChart from 'health_chart'
import PhChart from 'ph/chart'
import PhUsageChart from 'ph/control_chart'
import TempReadingsChart from 'temperature/readings_chart'
import TempControlChart from 'temperature/control_chart'

const flattenElements = (node) => {
  const elements = []
  const visit = child => {
    if (!child) {
      return
    }
    if (Array.isArray(child)) {
      child.forEach(visit)
      return
    }
    elements.push(child)
    if (child.props && child.props.children) {
      visit(child.props.children)
    }
  }
  visit(node)
  return elements
}

const findByType = (node, type) => flattenElements(node).filter(element => element.type === type)

const findByProps = (node, props) => {
  return flattenElements(node).find(element => {
    return Object.entries(props).every(([key, value]) => element.props && element.props[key] === value)
  })
}

// Minimal state shape so child component selectors have consistent props.
const childState = {
  equipment: [],
  atos: [],
  dosers: [],
  journals: [],
  lights: [],
  light_usage: {},
  ato_usage: {},
  doser_usage: {},
  journal_usage: {},
  phprobes: [],
  ph_readings: {},
  tcs: [],
  tc_usage: {},
  sensors: [],
  health_stats: {},
  readings: []
}

describe('Dashboard', () => {
  it('<Main /> smoke test via raw component (no config)', () => {
    const main = new RawDashboard({ config: undefined, fetchDashboard: jest.fn() })
    expect(main.charts()).toBeUndefined()
    expect(Main).toBeDefined()
  })

  it('<Main /> renders with empty grid_details', () => {
    const config = { row: 1, column: 1, width: 400, height: 200 }
    const main = new RawDashboard({ config, fetchDashboard: jest.fn() })
    expect(main.charts()).toBeUndefined()
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
    const main = new RawDashboard({ config, fetchDashboard: jest.fn() })
    const charts = main.charts()
    expect(findByType(charts, GenericLightChart)).toHaveLength(1)
    expect(findByType(charts, EquipmentChart)).toHaveLength(1)
    expect(findByType(charts, EquipmentCtrlPanel)).toHaveLength(1)
    expect(findByType(charts, BlankPanel)).toHaveLength(1)
    expect(findByType(charts, ATOChart)).toHaveLength(1)
    expect(findByType(charts, JournalChart)).toHaveLength(1)
    expect(findByType(charts, PhChart)).toHaveLength(2)
    expect(findByType(charts, PhUsageChart)).toHaveLength(1)
    expect(findByType(charts, DoserChart)).toHaveLength(1)
    expect(findByType(charts, HealthChart)).toHaveLength(1)
    expect(findByType(charts, TempReadingsChart)).toHaveLength(1)
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
    const main = new RawDashboard({ config, fetchDashboard: jest.fn() })
    const charts = main.charts()
    expect(findByType(charts, TempControlChart)).toHaveLength(1)
  })

  it('<Main /> handleToggle switches to config view', () => {
    const config = { row: 1, column: 1, width: 400, height: 200, grid_details: [[]] }
    const main = new RawDashboard({ config, fetchDashboard: jest.fn() })
    main.setState = update => { main.state = { ...main.state, ...update } }
    main.handleToggle()
    expect(main.state.showConfig).toBe(true)
    const rendered = main.render()
    expect(flattenElements(rendered).some(element => element.type === Config)).toBe(true)
  })

  it('<Main /> raw render smoke with config', () => {
    const config = { row: 1, column: 1, width: 400, height: 200, grid_details: [[]] }
    const main = new RawDashboard({ config, fetchDashboard: jest.fn() })
    expect(main.render()).toBeDefined()
  })

  it('<Grid />', () => {
    const hook = jest.fn()
    const cells = [
      [{ id: '1', type: 'light' }, { id: '2', type: 'light' }],
      [{ id: '1', type: 'equipment' }, { id: '2', type: 'ato' }]
    ]
    const grid = new Grid({ rows: 2, columns: 2, cells, hook, ...childState })
    grid.setState = update => { grid.state = { ...grid.state, ...update } }
    grid.setType(0, 0, 'equipment')()
    grid.setID(0, 0)('1')
    const menu = grid.menuItem({ name: 'ato', label: 'ATO' }, true, 0, 1)
    expect(menu.type).toBe('a')
    expect(hook).toHaveBeenCalled()
    expect(grid.render()).toBeDefined()
  })

  it('<ComponentSelector />', () => {
    const hook = jest.fn()
    const comps = {
      c1: { id: '1', name: 'foo' },
      c2: undefined
    }
    const selector = new ComponentSelector({ hook, components: comps, current_id: '1', selector_id: 'component-0-0' })
    selector.setState = update => { selector.state = { ...selector.state, ...update } }
    selector.setID(1, 'foo')({})
    expect(selector.state.current_id).toBe(1)
    expect(hook).toHaveBeenCalledWith(1)
  })

  it('<Config />', () => {
    const updateDashboard = jest.fn()
    const fetchDashboard = jest.fn()
    const cells = [[{ type: 'ato', id: '1' }]]
    const config = { row: 1, column: 1, width: 400, height: 200, grid_details: cells }
    const dashboardConfig = new RawConfig({
      ...childState,
      config,
      fetchDashboard,
      updateDashboard
    })
    dashboardConfig.setState = update => { dashboardConfig.state = { ...dashboardConfig.state, ...update } }
    expect(RawConfig.getDerivedStateFromProps({ config }, { updated: false, config: {} }).config).toEqual(config)
    dashboardConfig.updateHook([[{ type: 'ato', id: '1' }]])
    const rowInput = findByProps(dashboardConfig.toRow('row', 'Rows', 1, 12), { id: 'to-row-row' })
    rowInput.props.onChange({ target: { value: '2' } })
    dashboardConfig.handleSave()
    expect(updateDashboard).toHaveBeenCalled()
    expect(dashboardConfig.render()).toBeDefined()
  })
})
