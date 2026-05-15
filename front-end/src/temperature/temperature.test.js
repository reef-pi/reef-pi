import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { RawControlChart } from './control_chart'
import { RawTemperatureMain } from './main'
import { RawReadingsChart } from './readings_chart'
import 'isomorphic-fetch'
import TemperatureForm, { mapTemperaturePropsToValues } from './temperature_form'
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

const renderedChartData = component => component.render().props.children[1].props.children.props.data
const todayTimestamp = time => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const today = new Date()
  return `${months[today.getMonth()]}-${String(today.getDate()).padStart(2, '0')}-${time}, ${today.getFullYear()}`
}

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

  it('maps <TemperatureForm /> defaults for create', () => {
    expect(mapTemperaturePropsToValues({})).toEqual({
      id: '',
      name: '',
      sensor: '',
      analog_input: '',
      one_shot: false,
      fahrenheit: true,
      period: '60',
      enable: true,
      alerts: false,
      minAlert: '77',
      maxAlert: '81',
      fail_safe: false,
      heater: '',
      min: '',
      hysteresis: 0,
      cooler: '',
      max: '',
      control: '',
      chart: { ymax: 86, ymin: 74, color: '#000' }
    })
  })

  it('maps <TemperatureForm /> equipment control', () => {
    const tc = {
      id: '4',
      name: 'Water',
      sensor: 'sensor',
      analog_input: 'analog-input',
      one_shot: true,
      fahrenheit: false,
      period: '30',
      enable: false,
      control: true,
      is_macro: false,
      notify: { enable: true, min: 70, max: 90 },
      fail_safe: true,
      heater: 'heater',
      min: 70,
      hysteresis: 2,
      cooler: 'cooler',
      max: 85,
      chart: { ymax: 90, ymin: 70, color: '#f00' }
    }

    expect(mapTemperaturePropsToValues({ tc })).toEqual({
      id: '4',
      name: 'Water',
      sensor: 'sensor',
      analog_input: 'analog-input',
      one_shot: true,
      fahrenheit: false,
      period: '30',
      enable: false,
      alerts: true,
      minAlert: 70,
      maxAlert: 90,
      fail_safe: true,
      heater: 'heater',
      min: 70,
      hysteresis: 2,
      cooler: 'cooler',
      max: 85,
      control: 'equipment',
      chart: { ymax: 90, ymin: 70, color: '#f00' }
    })
  })

  it('maps <TemperatureForm /> macro control', () => {
    const tc = {
      control: true,
      is_macro: true,
      notify: {}
    }

    expect(mapTemperaturePropsToValues({ tc }).control).toBe('macro')
  })

  it('maps <TemperatureForm /> no control', () => {
    const tc = {
      control: false,
      is_macro: true,
      notify: {}
    }

    expect(mapTemperaturePropsToValues({ tc }).control).toBe('')
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
      fetchTCUsage: jest.fn(),
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

  it('<Main /> fetches usage and renders dashboard primitives behind feature flag', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    const fetchTCUsage = jest.fn()
    const now = new Date()
    const probe = {
      id: '1',
      name: 'Water',
      chart: {},
      enable: false,
      fahrenheit: true,
      min: 76,
      max: 80,
      notify: { enable: true, min: 74, max: 82 }
    }
    const component = new RawTemperatureMain({
      probes: [probe],
      currentReading: { 1: 78.2 },
      tcUsage: {
        1: {
          current: [
            { time: now.toISOString(), value: 78.2 },
            { time: new Date(now.getTime() - 3600000).toISOString(), value: 77.9 }
          ]
        }
      },
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
      fetchTCUsage,
      calibrateSensor: jest.fn()
    })

    component.componentDidMount()
    const children = component.probeList()[0].props.children

    expect(fetchTCUsage).toHaveBeenCalledWith('1')
    expect(children[0].props.probe).toBe(probe)
    expect(children[0].props.usage.current).toHaveLength(2)
    expect(children[0].props.currentReading).toBe(78.2)
    expect(children[1].props.showChart).toBe(false)
    window.FEATURE_FLAGS = {}
  })

  it('<Main /> renders dashboard primitives with readings and threshold gauge', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    const now = new Date()
    const probe = {
      id: '1',
      name: 'Water',
      chart: {},
      enable: false,
      fahrenheit: false,
      min: 24,
      max: 27,
      notify: { enable: true, min: 22, max: 29 }
    }
    const component = new RawTemperatureMain({
      probes: [probe],
      currentReading: { 1: 26.2 },
      tcUsage: {
        1: {
          current: [
            { time: now.toISOString(), value: 26.2 },
            { time: new Date(now.getTime() - 3600000).toISOString(), value: 25.8 },
            { time: new Date(now.getTime() - 3 * 86400000).toISOString(), value: 24.1 }
          ]
        }
      },
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
      fetchTCUsage: jest.fn(),
      calibrateSensor: jest.fn()
    })

    const html = renderToStaticMarkup(component.probeList()[0].props.children[0])

    expect(html).toContain('temp-1')
    expect(html).toContain('Water')
    expect(html).toContain('°C')
    window.FEATURE_FLAGS = {}
  })

  it('<Main /> omits dashboard primitives when usage is unavailable', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    const component = new RawTemperatureMain({
      probes: [{ id: '1', name: 'Water', chart: {}, enable: false, notify: { enable: false } }],
      currentReading: {},
      tcUsage: { 1: {} },
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
      fetchTCUsage: jest.fn(),
      calibrateSensor: jest.fn()
    })

    expect(renderToStaticMarkup(component.probeList()[0].props.children[0])).toBe('')
    window.FEATURE_FLAGS = {}
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

  it('<Main /> calibrate button uses first calibration point as default', () => {
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
    component.calibrateProbe({}, { id: '1', calibration_points: [{ expected: 76.5 }] })
    expect(component.state.defaultCalibrationPoint).toBe(76.5)
  })

  it('<Main /> dismisses and submits calibration modal state', () => {
    const calibrateSensor = jest.fn()
    const component = new RawTemperatureMain({
      probes: tcState.tcs,
      currentReading: { 1: 77.4 },
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
      calibrateSensor
    })
    component.setState = update => { component.state = { ...component.state, ...(typeof update === 'function' ? update(component.state) : update) } }
    component.setState({ currentProbe: tcState.tcs[0], showCalibrate: true })
    component.dismissModal()
    expect(component.state).toMatchObject({ currentProbe: null, showCalibrate: false })

    component.handleCalibrate(tcState.tcs[0], 76)
    expect(calibrateSensor).toHaveBeenCalledWith('1', [{ expected: 76, observed: 77.4 }])
    expect(component.state).toMatchObject({ currentProbe: null, showCalibrate: false })
  })

  it('<Main /> update and create handlers normalize probe payloads', () => {
    const update = jest.fn()
    const create = jest.fn()
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
      create,
      delete: jest.fn(),
      update,
      readTC: jest.fn(),
      calibrateSensor: jest.fn()
    })
    component.setState = update => { component.state = { ...component.state, ...(typeof update === 'function' ? update(component.state) : update) } }
    const values = {
      id: '1',
      name: 'Water',
      enable: true,
      control: 'equipment',
      one_shot: false,
      fail_safe: true,
      heater: 'heater',
      cooler: 'cooler',
      min: '76.1',
      max: '80.2',
      hysteresis: '0.3',
      sensor: 'sensor',
      analog_input: '',
      period: '30',
      fahrenheit: true,
      alerts: true,
      minAlert: '75',
      maxAlert: '82',
      chart: { color: '#f00', ymin: '70', ymax: '90' }
    }

    component.handleUpdate(values)
    expect(update).toHaveBeenCalledWith('1', expect.objectContaining({
      name: 'Water',
      control: true,
      is_macro: false,
      min: 76.1,
      max: 80.2,
      hysteresis: 0.3,
      period: 30,
      notify: { enable: true, min: 75, max: 82 },
      chart: { color: '#f00', ymin: 70, ymax: 90 }
    }))

    component.handleToggleAddProbeDiv()
    component.handleCreate({ ...values, id: undefined, control: 'macro' })
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ control: true, is_macro: true }))
    expect(component.state.addProbe).toBe(false)
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
    const current = [
      { time: todayTimestamp('10:10'), value: 4 },
      { time: todayTimestamp('10:00'), value: 1 },
      { time: todayTimestamp('10:00'), value: 2 }
    ]
    const originalCurrent = current.map(reading => ({ ...reading }))
    const instance = new RawReadingsChart({
      config: { id: '1', name: 'Water', chart: { color: '#f00', ymin: 70, ymax: 90 }, fahrenheit: true },
      usage: { current },
      sensor_id: '1',
      fetch,
      height: 200
    })
    instance.setState = update => { instance.state = { ...instance.state, ...(typeof update === 'function' ? update(instance.state) : update) } }
    instance.componentDidMount()
    expect(fetch).toHaveBeenCalledWith('1')
    expect(instance.render().props.className).toBe('container')
    expect(renderedChartData(instance).map(reading => reading.value)).toEqual([1, 2, 4])
    expect(current).toEqual(originalCurrent)
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
    const historical = [
      { time: 'Jul-01-10:10, 2024', cooler: 4, up: 4, down: 0, value: 74 },
      { time: 'Jul-01-10:00, 2024', cooler: 1, up: 2, down: 0, value: 72 },
      { time: 'Jul-01-10:00, 2024', cooler: 2, up: 3, down: 0, value: 73 }
    ]
    const originalHistorical = historical.map(reading => ({ ...reading }))
    const instance = new RawControlChart({
      config: { id: '1', name: 'Water', chart: { color: '#f00', ymin: 70, ymax: 90 }, fahrenheit: true },
      usage: { historical, current: [] },
      sensor_id: '1',
      fetchTCUsage,
      height: 200
    })
    instance.setState = update => { instance.state = { ...instance.state, ...(typeof update === 'function' ? update(instance.state) : update) } }
    instance.componentDidMount()
    expect(fetchTCUsage).toHaveBeenCalledWith('1')
    expect(instance.render().props.className).toBe('container')
    expect(renderedChartData(instance).map(reading => reading.value)).toEqual([72, 73, 74])
    expect(renderedChartData(instance).map(reading => reading.cooler)).toEqual([-1, -2, -4])
    expect(historical).toEqual(originalHistorical)
    expect(historical[0].ts).toBeUndefined()
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
