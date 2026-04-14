import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ComponentSelector from './component_selector'
import { ConfigView } from './config'
import Grid, { numColsToColSize } from './grid'
import { DashboardView } from './main'
import * as Alert from '../utils/alert'

describe('Dashboard', () => {
  it('<DashboardView /> renders with and without config', () => {
    const fetchDashboard = jest.fn()
    const config = {
      row: 4,
      column: 2,
      width: 400,
      height: 200,
      grid_details: [
        [{ type: 'equipment_barchart' }, { type: 'ato', id: '1' }],
        [{ type: 'lights', id: '1' }, { type: 'health', id: 'current' }],
        [{ type: 'ph_current', id: '1' }, { type: 'ph_historical', id: 'current' }],
        [{ type: 'temp_historical', id: '1' }, { type: 'temp_current', id: 'current' }]
      ]
    }

    const withConfig = new DashboardView({ config, fetchDashboard })
    withConfig.setState = jest.fn(update => {
      withConfig.state = { ...withConfig.state, ...update }
    })
    withConfig.componentDidMount()
    expect(fetchDashboard).toHaveBeenCalled()
    expect(() => withConfig.render()).not.toThrow()
    withConfig.handleToggle()
    expect(withConfig.state.showConfig).toBe(true)

    const withoutConfig = new DashboardView({ fetchDashboard })
    expect(() => withoutConfig.render()).not.toThrow()
  })

  it('<Grid /> updates type and id through hooks', () => {
    const hook = jest.fn()
    const cells = [
      [{ id: '1', type: 'lights' }, { id: '2', type: 'lights' }],
      [{ id: '1', type: 'equipment_barchart' }, { id: '2', type: 'ato' }]
    ]
    const grid = new Grid({ rows: 2, columns: 2, cells, hook })
    grid.setState = jest.fn(update => {
      grid.state = { ...grid.state, ...update }
    })
    grid.setType(0, 0, 'equipment_barchart')()
    grid.setID(0, 0)('1')
    const item = grid.menuItem({ name: 'ato', label: 'ATO' }, true, 0, 1)
    expect(item.props.children.props.id).toBe('ato-0-1')
    expect(hook).toHaveBeenCalled()
    expect(renderToStaticMarkup(grid.render())).toContain('reef-pi-grid')
    expect(numColsToColSize(1)).toBe(12)
    expect(numColsToColSize(2)).toBe(6)
    expect(numColsToColSize(7)).toBe(1)
  })

  it('<ComponentSelector /> updates selected component', () => {
    const hook = jest.fn()
    const comps = {
      c1: { id: '1', name: 'foo' },
      c2: undefined
    }
    const selector = new ComponentSelector({ hook, components: comps, current_id: '1', selector_id: 'selector' })
    selector.setState = jest.fn(update => {
      selector.state = { ...selector.state, ...update }
    })
    selector.setID(1, 'foo')({})
    expect(selector.state.title).toBe('foo')
    expect(selector.state.current_id).toBe(1)
    expect(hook).toHaveBeenCalledWith(1)
  })

  it('<ConfigView /> derives state, updates grid, and saves', () => {
    const updateDashboard = jest.fn()
    const fetchDashboard = jest.fn()
    const showUpdateSuccessful = jest.spyOn(Alert, 'showUpdateSuccessful').mockImplementation(() => {})
    const showError = jest.spyOn(Alert, 'showError').mockImplementation(() => {})
    const cells = [[{ type: 'ato', id: '1' }]]
    const config = { row: 1, column: 1, width: 400, height: 200, grid_details: cells }
    const view = new ConfigView({
      config,
      updateDashboard,
      fetchDashboard,
      atos: [],
      phs: [],
      tcs: [],
      lights: [],
      dosers: [],
      equips: [],
      journals: [],
      blank: []
    })
    view.setState = jest.fn(update => {
      view.state = { ...view.state, ...update }
    })

    view.componentDidMount()
    expect(fetchDashboard).toHaveBeenCalled()

    const derived = ConfigView.getDerivedStateFromProps({ config }, { updated: false, config: {} })
    expect(derived.config.grid_details[0][0].type).toBe('ato')

    view.state.config = JSON.parse(JSON.stringify(config))
    const rowControl = view.toRow('row', 'Rows', 1, 12)
    rowControl.props.children[1].props.onChange({ target: { value: '2' } })
    expect(view.state.config.row).toBe(2)

    view.updateHook([[{ id: '2', type: 'equipment_barchart' }]])
    expect(view.state.config.grid_details[0][0]).toEqual({ id: '2', type: 'equipment_barchart' })

    view.state.config = { row: 1, column: 1, width: 400, height: 200, grid_details: [[{ id: '2', type: 'equipment_barchart' }]] }
    view.handleSave()
    expect(updateDashboard).toHaveBeenCalled()
    expect(showUpdateSuccessful).toHaveBeenCalled()

    view.state.config = { row: 0, column: 1, width: 400, height: 200, grid_details: [[{ id: '2', type: 'equipment_barchart' }]] }
    view.handleSave()
    expect(showError).toHaveBeenCalled()
  })
})
