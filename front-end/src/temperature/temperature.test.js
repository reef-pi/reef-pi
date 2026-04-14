import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ControlChart, { ControlChartView } from './control_chart'
import Main, { MainView } from './main'
import ReadingsChart, { ReadingsChartView } from './readings_chart'
import 'isomorphic-fetch'
import TemperatureForm, { temperatureFormValues, submitTemperatureForm } from './temperature_form'
jest.mock('utils/confirm', () => {
  return {
    confirm: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this)
  }
})
describe('Temperature controller ui', () => {
  const state = {
    tcs: [{ id: '1', name: 'Water', chart:{} }, { id: '2', name: 'Air', chart:{} } ],
    tc_usage: { 1: { historical: [{ cooler: 1 }], current: [] } },
    tc_reading: [],
    equipment: [{ id: '1', name: 'bar', on: false }],
    macros: [{id: '1', name: 'macro'}]
  }

  it('<Main />', () => {
    const props = {
      probes: state.tcs,
      sensors: [],
      analogInputs: [],
      equipment: state.equipment,
      macros: state.macros,
      currentReading: {},
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      readTC: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      calibrateSensor: jest.fn()
    }
    const view = new MainView(props)
    view.setState = jest.fn(updateState => {
      view.state = { ...view.state, ...updateState }
    })
    view.componentDidMount()
    expect(props.fetchSensors).toHaveBeenCalled()
    expect(props.fetchTCs).toHaveBeenCalled()
    expect(props.fetchEquipment).toHaveBeenCalled()
    expect(props.fetchAnalogInputs).toHaveBeenCalled()
    expect(props.readTC).toHaveBeenCalledWith('1')
    expect(props.readTC).toHaveBeenCalledWith('2')
    expect(() => renderToStaticMarkup(<MainView {...props} />)).not.toThrow()
    expect(Main).toBeDefined()
  })

  it('<ReadingsChartView />', () => {
    jest.useFakeTimers()
    const fetch = jest.fn()
    const chart = new ReadingsChartView({
      sensor_id: '1',
      config: { id: '1', name: 'Water', fahrenheit: true, chart: { ymin: 72, ymax: 78, color: '#000' } },
      usage: { current: [{ value: 1, time: '2024-01-01T00:00:00Z' }, { value: 4, time: '2024-01-01T00:01:00Z' }] },
      fetch,
      height: 100
    })
    chart.setState = jest.fn(updateState => {
      chart.state = { ...(chart.state || {}), ...updateState }
    })
    chart.componentDidMount()
    expect(fetch).toHaveBeenCalledWith('1')
    expect(() => renderToStaticMarkup(<ReadingsChartView sensor_id='1' config={{ id: '1', name: 'Water', fahrenheit: true, chart: { ymin: 72, ymax: 78, color: '#000' } }} usage={{ current: [] }} fetch={fetch} height={100} />)).not.toThrow()
    expect(() => renderToStaticMarkup(<ReadingsChartView sensor_id='1' usage={{ current: [] }} fetch={fetch} />)).not.toThrow()
    expect(() => renderToStaticMarkup(<ReadingsChartView sensor_id='1' config={{ id: '1', name: 'Water', fahrenheit: true, chart: { ymin: 72, ymax: 78, color: '#000' } }} fetch={fetch} />)).not.toThrow()
    chart.componentWillUnmount()
    jest.useRealTimers()
    expect(ReadingsChart).toBeDefined()
  })

  it('<ControlChartView />', () => {
    jest.useFakeTimers()
    const fetchTCUsage = jest.fn()
    const chart = new ControlChartView({
      sensor_id: '1',
      config: { id: '1', name: 'Water', fahrenheit: true, chart: { ymin: 72, ymax: 78, color: '#000' } },
      usage: { historical: [{ cooler: 1, down: 0, up: 1, value: 75, time: '2024-01-01T00:00:00Z' }], current: [] },
      fetchTCUsage,
      height: 100
    })
    chart.setState = jest.fn(updateState => {
      chart.state = { ...(chart.state || {}), ...updateState }
    })
    chart.componentDidMount()
    expect(fetchTCUsage).toHaveBeenCalledWith('1')
    expect(() => renderToStaticMarkup(<ControlChartView sensor_id='1' config={{ id: '1', name: 'Water', fahrenheit: true, chart: { ymin: 72, ymax: 78, color: '#000' } }} usage={{ historical: [], current: [] }} fetchTCUsage={fetchTCUsage} height={100} />)).not.toThrow()
    expect(() => renderToStaticMarkup(<ControlChartView sensor_id='1' usage={{ historical: [], current: [] }} fetchTCUsage={fetchTCUsage} />)).not.toThrow()
    expect(() => renderToStaticMarkup(<ControlChartView sensor_id='1' config={{ id: '1', name: 'Water', fahrenheit: true, chart: { ymin: 72, ymax: 78, color: '#000' } }} fetchTCUsage={fetchTCUsage} />)).not.toThrow()
    chart.componentWillUnmount()
    jest.useRealTimers()
    expect(ControlChart).toBeDefined()
  })

  it('<TemperatureForm /> for create', () => {
    const fn = jest.fn()
    const values = temperatureFormValues({})
    submitTemperatureForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalled()
  })

  it('<TemperatureForm /> for edit', () => {
    const fn = jest.fn()

    const tc = {
      id: '4',
      name: 'name',
      sensor: 'sensor',
      enable: true,
      control: false,
      is_macro: false,
      min: 70,
      max: 85,
      notify: {
        enable: true,
        min: 70,
        max: 90
      }
    }
    const values = temperatureFormValues({ tc })
    submitTemperatureForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalled()
  })

  it('<TemperatureForm /> for edit with macro', () => {
    const fn = jest.fn()

    const tc = {
      id: '4',
      name: 'name',
      sensor: 'sensor',
      control: true,
      is_macro: true,
      min: 70,
      max: 85,
      notify: {
        enable: true,
        min: 70,
        max: 90
      }
    }
    expect(temperatureFormValues({ tc }).control).toBe('macro')
  })

  it('<TemperatureForm /> for edit with equipment', () => {
    const fn = jest.fn()

    const tc = {
      id: '4',
      name: 'name',
      sensor: 'sensor',
      enable: true,
      control: true,
      is_macro: false,
      min: 70,
      max: 85,
      notify: {
        enable: true,
        min: 70,
        max: 90
      }
    }
    expect(temperatureFormValues({ tc }).control).toBe('equipment')
  })

})
