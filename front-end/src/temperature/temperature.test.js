import React from 'react'
import Main, { RawTemperatureMain } from './main'
import ControlChart, { RawControlChart } from './control_chart'
import ReadingsChart, { RawReadingsChart } from './readings_chart'
import TemperatureForm, { mapTemperaturePropsToValues, submitTemperatureForm } from './temperature_form'
import EditTemperature from './edit_temperature'

jest.mock('utils/confirm', () => {
  return {
    confirm: jest
      .fn()
      .mockImplementation(() => Promise.resolve(true))
      .bind(this)
  }
})

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
    tcs: [{ id: '1', name: 'Water', chart: {} }, { id: '2', name: 'Air', chart: {} }],
    tc_usage: { 1: { historical: [{ cooler: 1, time: '2026-04-26T00:00:00Z', value: 77, up: 0, down: 0 }], current: [] } },
    tc_reading: [],
    equipment: [{ id: '1', name: 'bar', on: false }],
    macros: [{ id: '1', name: 'macro' }]
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Main /> mounts with empty tcs', () => {
    const main = new RawTemperatureMain({
      probes: [],
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      currentReading: {},
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      readTC: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      calibrateSensor: jest.fn()
    })
    expect(main.render().type).toBe('div')
    expect(Main).toBeDefined()
  })

  it('<Main /> mounts with tcs', () => {
    const main = new RawTemperatureMain({
      probes: tcState.tcs,
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      currentReading: {},
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      readTC: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      calibrateSensor: jest.fn()
    })
    expect(main.probeList()).toHaveLength(1)
  })

  it('<Main /> toggles add probe form', () => {
    const main = new RawTemperatureMain({
      probes: [],
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      currentReading: {},
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      readTC: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      calibrateSensor: jest.fn()
    })
    main.setState = update => { main.state = { ...main.state, ...update } }
    main.handleToggleAddProbeDiv()
    expect(main.state.addProbe).toBe(true)
    main.handleToggleAddProbeDiv()
    expect(main.state.addProbe).toBe(false)
  })

  it('<Main /> delete tc triggers confirm', async () => {
    const del = jest.fn()
    const main = new RawTemperatureMain({
      probes: tcState.tcs,
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      currentReading: {},
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      readTC: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: del,
      calibrateSensor: jest.fn()
    })
    main.handleDelete(tcState.tcs[0])
    await Promise.resolve()
    expect(del).toHaveBeenCalledWith('1')
  })

  it('<Main /> calibrate button opens wizard', () => {
    const main = new RawTemperatureMain({
      probes: [{ ...tcState.tcs[0], calibration_points: [{ expected: '77' }] }],
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      currentReading: { 1: 77 },
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      readTC: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      calibrateSensor: jest.fn()
    })
    main.setState = update => { main.state = { ...main.state, ...update } }
    main.calibrateProbe({}, main.props.probes[0])
    expect(main.state.showCalibrate).toBe(true)
    expect(main.state.defaultCalibrationPoint).toBe('77')
  })

  it('<Main /> valuesToProbe and update/create handlers', () => {
    const update = jest.fn()
    const create = jest.fn()
    const main = new RawTemperatureMain({
      probes: [],
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      currentReading: {},
      fetchSensors: jest.fn(),
      fetchTCs: jest.fn(),
      fetchEquipment: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      readTC: jest.fn(),
      create,
      update,
      delete: jest.fn(),
      calibrateSensor: jest.fn()
    })
    main.setState = updateState => { main.state = { ...main.state, ...updateState } }
    const values = {
      id: '1',
      name: 'Water',
      enable: true,
      control: 'macro',
      one_shot: false,
      fail_safe: false,
      heater: '',
      cooler: '',
      min: '70',
      max: '85',
      hysteresis: '1',
      sensor: 'sensor',
      analog_input: '',
      period: '60',
      fahrenheit: true,
      alerts: true,
      minAlert: '70',
      maxAlert: '90',
      chart: { color: '#000', ymin: '74', ymax: '86' }
    }
    const payload = main.valuesToProbe(values)
    expect(payload.control).toBe(true)
    expect(payload.is_macro).toBe(true)
    main.handleUpdate(values)
    main.handleCreate(values)
    expect(update).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Water' }))
    expect(create).toHaveBeenCalled()
  })

  it('<ReadingsChart />', () => {
    const noUsage = new RawReadingsChart({ sensor_id: '1', fetch: jest.fn(), usage: undefined, config: undefined })
    expect(noUsage.render().type).toBe('div')
    const withUsage = new RawReadingsChart({
      sensor_id: '1',
      fetch: jest.fn(),
      usage: { current: [{ time: '2026-04-26T00:00:00Z', value: 77 }, { time: '2026-04-26T01:00:00Z', value: 78 }] },
      config: { name: 'Water', chart: { color: '#f00', ymin: 70, ymax: 90 }, fahrenheit: true },
      height: 300
    })
    expect(withUsage.render().type).toBe('div')
    expect(ReadingsChart).toBeDefined()
  })

  it('<ControlChart />', () => {
    const noConfig = new RawControlChart({ sensor_id: '1', fetchTCUsage: jest.fn(), config: undefined, usage: undefined })
    expect(noConfig.render().type).toBe('div')
    const withUsage = new RawControlChart({
      sensor_id: '1',
      fetchTCUsage: jest.fn(),
      config: { name: 'Water', chart: { color: '#f00', ymin: 70, ymax: 90 }, fahrenheit: true },
      usage: { historical: [{ cooler: 1, heater: 0, up: 0, down: 0, time: '2026-04-26T00:00:00Z', value: 77 }] },
      height: 300
    })
    expect(withUsage.render().type).toBe('div')
    expect(ControlChart).toBeDefined()
  })

  it('<TemperatureForm /> for create', () => {
    const fn = jest.fn()
    const values = mapTemperaturePropsToValues({})
    submitTemperatureForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalled()
    expect(TemperatureForm).toBeDefined()
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
    const values = mapTemperaturePropsToValues({ tc })
    submitTemperatureForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalled()
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
    const values = mapTemperaturePropsToValues({ tc })
    expect(values.control).toBe('macro')
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
    const values = mapTemperaturePropsToValues({ tc })
    expect(values.control).toBe('equipment')
  })

  it('<EditTemperature /> renders chart path when enabled and controlled', () => {
    const values = {
      ...mapTemperaturePropsToValues({ tc: { id: '1', enable: true, heater: '1', chart: { color: '#000', ymin: 70, ymax: 90 } } }),
      id: '1',
      enable: true,
      heater: '1',
      cooler: '',
      chart: { color: '#000', ymin: 70, ymax: 90 }
    }
    const tree = EditTemperature({
      values,
      errors: {},
      touched: {},
      sensors: [],
      analogInputs: [],
      equipment: [],
      macros: [],
      submitForm: jest.fn(),
      isValid: true,
      dirty: true,
      readOnly: false,
      showChart: true
    })
    expect(tree.type).toBe('form')
  })
})
