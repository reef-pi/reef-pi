import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import ConfiguredGrid from './configured_grid'

const stub = name => function Stub (props) {
  return <div data-stub={name} data-props={JSON.stringify(props)} />
}

jest.mock('temperature/readings_chart', () => stub('TempReadingsChart'))
jest.mock('temperature/control_chart', () => stub('TempControlChart'))
jest.mock('equipment/chart', () => stub('EquipmentChart'))
jest.mock('equipment/ctrl_panel', () => stub('EquipmentCtrlPanel'))
jest.mock('dashboard/blank_panel', () => stub('BlankPanel'))
jest.mock('journal/chart', () => stub('JournalChart'))
jest.mock('lighting/charts/generic', () => stub('GenericLightChart'))
jest.mock('ato/chart', () => stub('ATOChart'))
jest.mock('doser/chart', () => stub('DoserChart'))
jest.mock('health_chart', () => stub('HealthChart'))
jest.mock('ph/chart', () => stub('PhChart'))
jest.mock('ph/control_chart', () => stub('PhUsageChart'))

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function render (config) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(<ConfiguredGrid config={config} />))
  return {
    container,
    cells: () => Array.from(container.querySelectorAll('[data-testid^="dashboard-cell-"]')),
    stubIn: cell => {
      const node = cell.querySelector('[data-stub]')
      return node && { name: node.getAttribute('data-stub'), props: JSON.parse(node.getAttribute('data-props')) }
    },
    cleanup: () => {
      act(() => root.unmount())
      container.remove()
    }
  }
}

const seeded = {
  row: 3,
  column: 2,
  width: 500,
  height: 300,
  grid_details: [
    [{ type: 'temp_current', id: '1' }, { type: 'ph_current', id: '2' }],
    [{ type: 'ato', id: '3' }, { type: 'equipment_ctrlpanel', id: 'current' }],
    [{ type: 'lights', id: '4' }, { type: 'health', id: 'current' }]
  ]
}

describe('<ConfiguredGrid />', () => {
  it('renders every configured cell, row by row, with its chart bound to the configured id', () => {
    const view = render(seeded)
    const cells = view.cells()

    expect(cells.map(cell => cell.getAttribute('data-testid'))).toEqual([
      'dashboard-cell-0-0', 'dashboard-cell-0-1',
      'dashboard-cell-1-0', 'dashboard-cell-1-1',
      'dashboard-cell-2-0', 'dashboard-cell-2-1'
    ])
    expect(cells.map(cell => cell.getAttribute('data-chart-type'))).toEqual([
      'temp_current', 'ph_current', 'ato', 'equipment_ctrlpanel', 'lights', 'health'
    ])

    const charts = cells.map(view.stubIn)
    expect(charts[0]).toEqual({ name: 'TempReadingsChart', props: { width: 500, height: 300, sensor_id: '1' } })
    expect(charts[1]).toEqual({ name: 'PhChart', props: { width: 500, height: 300, probe_id: '2', type: 'current' } })
    expect(charts[2]).toEqual({ name: 'ATOChart', props: { width: 500, height: 300, ato_id: '3' } })
    expect(charts[3]).toEqual({ name: 'EquipmentCtrlPanel', props: { width: 500, height: 300 } })
    expect(charts[4]).toEqual({ name: 'GenericLightChart', props: { width: 500, height: 300, light_id: '4' } })
    expect(charts[5]).toEqual({ name: 'HealthChart', props: { width: 500, height: 300, trend: 'current' } })
    view.cleanup()
  })

  it('maps the remaining chart types to their per-id charts', () => {
    const view = render({
      row: 1,
      column: 7,
      width: 400,
      height: 200,
      grid_details: [[
        { type: 'temp_historical', id: '1' },
        { type: 'ph_historical', id: '2' },
        { type: 'ph_usage', id: '2' },
        { type: 'doser', id: '5' },
        { type: 'journal', id: '6' },
        { type: 'equipment_barchart', id: 'current' },
        { type: 'blank_panel', id: 'none' }
      ]]
    })
    expect(view.cells().map(view.stubIn)).toEqual([
      { name: 'TempControlChart', props: { width: 400, height: 200, sensor_id: '1' } },
      { name: 'PhChart', props: { width: 400, height: 200, probe_id: '2', type: 'historical' } },
      { name: 'PhUsageChart', props: { width: 400, height: 200, probe_id: '2', type: 'historical' } },
      { name: 'DoserChart', props: { width: 400, height: 200, doser_id: '5' } },
      { name: 'JournalChart', props: { width: 400, height: 200, journal_id: '6' } },
      { name: 'EquipmentChart', props: { width: 400, height: 200 } },
      { name: 'BlankPanel', props: { width: 400, height: 200 } }
    ])
    view.cleanup()
  })

  it('shows the current health trend when a health cell has no trend saved (the server default dashboard)', () => {
    const view = render({ row: 1, column: 3, width: 500, height: 300, grid_details: [[{ type: 'health' }, { type: 'health', id: 'none' }, { type: 'health', id: 'historical' }]] })
    expect(view.cells().map(cell => view.stubIn(cell).props.trend)).toEqual(['current', 'current', 'historical'])
    view.cleanup()
  })

  it('lays the grid out with the configured column count', () => {
    const view = render(seeded)
    const grid = view.container.querySelector('[data-testid="dashboard-grid"]')
    expect(grid.style.getPropertyValue('--dashboard-columns')).toBe('2')
    view.cleanup()
  })

  it('only renders cells inside the configured rows and columns, filling gaps with blank panels', () => {
    const view = render({
      row: 2,
      column: 2,
      width: 500,
      height: 300,
      grid_details: [
        [{ type: 'health', id: 'current' }, { type: 'health', id: 'historical' }, { type: 'doser', id: '9' }],
        [{ type: 'ato', id: '3' }]
      ]
    })
    expect(view.cells().map(cell => cell.getAttribute('data-chart-type'))).toEqual([
      'health', 'health', 'ato', 'blank_panel'
    ])
    view.cleanup()
  })

  it('skips cells of an unknown chart type instead of crashing', () => {
    const view = render({ row: 1, column: 2, width: 500, height: 300, grid_details: [[{ type: 'bogus', id: '1' }, { type: 'health', id: 'current' }]] })
    expect(view.cells().map(cell => cell.getAttribute('data-chart-type'))).toEqual(['health'])
    view.cleanup()
  })

  it('renders nothing until the dashboard config has loaded', () => {
    for (const config of [undefined, {}, { row: 1, column: 1 }]) {
      const view = render(config)
      expect(view.container.querySelector('[data-testid="dashboard-grid"]')).toBeNull()
      view.cleanup()
    }
  })
})
