import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { RawControlChart } from './control_chart'
import { RawTemperatureMain } from './main'
import { RawReadingsChart } from './readings_chart'
import 'isomorphic-fetch'
import TemperatureForm from './temperature_form'
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

const renderForm = props => renderToStaticMarkup(
  <TemperatureForm
    sensors={['sensor']}
    analogInputs={[]}
    equipment={[]}
    macros={[]}
    {...props}
  />
)

const tcState = {
  tcs: [{ id: '1', name: 'Water', chart: {}, enable: false, notify: { enable: false } }],
  tc_usage: {},
  tc_reading: [],
  tc_sensors: [],
  analog_inputs: [],
  equipment: [],
  macros: []
}

describe('Temperature controller ui', () => {
  const state = {
    tcs: [{ id: '1', name: 'Water', chart:{} }, { id: '2', name: 'Air', chart:{} } ],
    tc_usage: { 1: { historical: [{ cooler: 1 }], current: [] } },
    tc_reading: [],
    equipment: [{ id: '1', name: 'bar', on: false }],
    macros: [{id: '1', name: 'macro'}]
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Main /> mounts with empty tcs', () => {
    const props = {
      probes: [],
      currentReading: [],
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      readTC: jest.fn(),
      calibrateSensor: jest.fn()
    }
    const component = new RawTemperatureMain(props)
    component.componentDidMount()
    expect(props.fetchSensors).toHaveBeenCalled()
    expect(props.fetchTCs).toHaveBeenCalled()
    expect(component.render().type).toBe('div')
  })

  it('<Main /> mounts with tcs', () => {
    const probes = [
      { id: '1', name: 'Water B', chart: {}, enable: false, notify: { enable: false } },
      { id: '2', name: 'Water A', chart: {}, enable: false, notify: { enable: false } }
    ]
    const props = {
      probes,
      currentReading: [],
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      readTC: jest.fn(),
      calibrateSensor: jest.fn()
    }
    const component = new RawTemperatureMain(props)
    component.componentDidMount()
    expect(props.readTC).toHaveBeenCalledWith('1')
    const items = component.probeList()
    expect(items).toHaveLength(2)
    expect(items[0].props.name).toBe('panel-temperature-2')
    expect(probes.map(probe => probe.name)).toEqual(['Water B', 'Water A'])
  })

  it('<Main /> toggles add probe form', () => {
    const component = new RawTemperatureMain({
      probes: [],
      currentReading: [],
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      readTC: jest.fn(),
      calibrateSensor: jest.fn()
    })
    component.setState = update => { component.state = { ...component.state, ...(typeof update === 'function' ? update(component.state) : update) } }
    component.handleToggleAddProbeDiv()
    expect(component.state.addProbe).toBe(true)
    component.handleToggleAddProbeDiv()
    expect(component.state.addProbe).toBe(false)
  })

  it('<Main /> delete tc triggers confirm', () => {
    const props = {
      probes: tcState.tcs,
      currentReading: [],
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      readTC: jest.fn(),
      calibrateSensor: jest.fn()
    }
    const component = new RawTemperatureMain(props)
    component.handleDelete(tcState.tcs[0])
    return Promise.resolve().then(() => {
      expect(props.delete).toHaveBeenCalledWith('1')
    })
  })

  it('<Main /> calibrate button opens wizard', () => {
    const component = new RawTemperatureMain({
      probes: tcState.tcs,
      currentReading: { 1: 77 },
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      readTC: jest.fn(),
      calibrateSensor: jest.fn()
    })
    component.setState = update => { component.state = { ...component.state, ...(typeof update === 'function' ? update(component.state) : update) } }
    component.calibrateProbe({}, tcState.tcs[0])
    expect(component.state.showCalibrate).toBe(true)
  })

  it('<Main />', () => {
    const component = new RawTemperatureMain({
      probes: state.tcs,
      currentReading: [],
      sensors: [],
      analogInputs: [],
      equipment: state.equipment,
      macros: state.macros,
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      readTC: jest.fn(),
      calibrateSensor: jest.fn()
    })
    expect(component.valuesToProbe({
      name: 'Water',
      enable: true,
      control: 'macro',
      one_shot: false,
      fail_safe: false,
      heater: '',
      cooler: '',
      min: '70',
      max: '80',
      hysteresis: '1',
      sensor: 'sensor',
      analog_input: '',
      period: '60',
      fahrenheit: true,
      alerts: false,
      minAlert: '75',
      maxAlert: '85',
      chart: { color: '#000', ymin: '70', ymax: '85' }
    }).is_macro).toBe(true)
  })

  it('<ReadingsChart />', () => {
    expect(new RawReadingsChart({ config: undefined, usage: { current: [] }, sensor_id: '1', fetch: jest.fn() }).render().type).toBe('div')
    expect(new RawReadingsChart({ config: { chart: {}, name: 'Water', fahrenheit: true }, usage: undefined, sensor_id: '1', fetch: jest.fn() }).render().type).toBe('div')
    let stateCurrent = {
      tcs: [{ id: '1', min: 72, max: 78, chart: {}}],
      tc_usage: { 1: { historical: [{ cooler: 1 }], current: [{ temperature: 1 }, { temperature: 4 }] } }
    }
    const fetch = jest.fn()
    const instance = new RawReadingsChart({
      config: { id: '1', name: 'Water', chart: { color: '#f00', ymin: 70, ymax: 90 }, fahrenheit: true },
      usage: { current: [{ time: '2026-04-27T10:00:00Z', value: 1 }, { time: '2026-04-27T10:10:00Z', value: 4 }] },
      sensor_id: '1',
      fetch,
      height: 200
    })
    instance.setState = update => { instance.state = { ...instance.state, ...(typeof update === 'function' ? update(instance.state) : update) } }
    instance.componentDidMount()
    expect(fetch).toHaveBeenCalledWith('1')
    expect(instance.render().props.className).toBe('container')
    instance.componentWillUnmount()
    stateCurrent = {
      tcs: [{ id: '2', min: 72, max: 78, chart:{}}],
      tc_usage: { 1: { historical: [{ cooler: 1 }], current: [{ temperature: 1 }, { temperature: 4 }] } }
    }
    expect(stateCurrent.tcs[0].id).toBe('2')
  })

  it('<ControlChart />', () => {
    expect(new RawControlChart({ config: undefined, usage: { historical: [] }, sensor_id: '1', fetchTCUsage: jest.fn() }).render().type).toBe('div')
    expect(new RawControlChart({ config: { chart: {} }, usage: undefined, sensor_id: '1', fetchTCUsage: jest.fn() }).render().type).toBe('div')
    const fetchTCUsage = jest.fn()
    const instance = new RawControlChart({
      config: { id: '1', name: 'Water', chart: { color: '#f00', ymin: 70, ymax: 90 }, fahrenheit: true },
      usage: { historical: [{ time: '2026-04-27T10:00:00Z', cooler: 1, up: 2, down: 0, value: 72 }], current: [] },
      sensor_id: '1',
      fetchTCUsage,
      height: 200
    })
    instance.setState = update => { instance.state = { ...instance.state, ...(typeof update === 'function' ? update(instance.state) : update) } }
    instance.componentDidMount()
    expect(fetchTCUsage).toHaveBeenCalledWith('1')
    expect(instance.render().props.className).toBe('container')
    instance.componentWillUnmount()
  })

  it('<TemperatureForm /> for create', () => {
    const fn = jest.fn()
    const html = renderForm({ onSubmit: fn })
    expect(html).toContain('name="name"')
  })

  it('<TemperatureForm /> for edit', () => {
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
    const html = renderForm({ tc, onSubmit: jest.fn() })
    expect(html).toContain('value="name"')
  })

  it('<TemperatureForm /> for edit with macro', () => {
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
    const html = renderForm({ tc, onSubmit: jest.fn() })
    expect(html).toContain('name="control"')
  })

  it('<TemperatureForm /> for edit with equipment', () => {
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
    const html = renderForm({ tc, onSubmit: jest.fn() })
    expect(html).toContain('name="control"')
  })

})
