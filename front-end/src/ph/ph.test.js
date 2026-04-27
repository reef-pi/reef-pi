import React from 'react'
import PhForm, { mapPhPropsToValues, submitPhForm } from './ph_form'
import Chart, { RawPhChart } from './chart'
import Main, { RawPhMain } from './main'

jest.mock('utils/confirm', () => {
  return {
    showModal: jest.fn().mockImplementation(() => Promise.resolve(true)).bind(this),
    confirm: jest.fn().mockImplementation(() => Promise.resolve(true)).bind(this)
  }
})

const phState = {
  phprobes: [{ id: '1', name: 'probe', enable: false, notify: { enable: false }, control: false, chart: {} }],
  analog_inputs: [],
  ph_reading: [],
  macros: [],
  equipment: []
}

describe('Ph ui', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Main /> mounts with empty probes', () => {
    const main = new RawPhMain({
      probes: [],
      ais: [],
      currentReading: [],
      macros: [],
      equipment: [],
      fetchPhProbes: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      calibrateProbe: jest.fn(),
      readProbe: jest.fn()
    })
    expect(main.render().type).toBe('div')
    expect(Main).toBeDefined()
  })

  it('<Main /> mounts with probes', () => {
    const main = new RawPhMain({
      probes: phState.phprobes,
      ais: [],
      currentReading: [],
      macros: [],
      equipment: [],
      fetchPhProbes: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      calibrateProbe: jest.fn(),
      readProbe: jest.fn()
    })
    expect(main.probeList()).toHaveLength(1)
  })

  it('<Main /> toggles add probe form', () => {
    const main = new RawPhMain({
      probes: [],
      ais: [],
      currentReading: [],
      macros: [],
      equipment: [],
      fetchPhProbes: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      calibrateProbe: jest.fn(),
      readProbe: jest.fn()
    })
    main.setState = update => { main.state = { ...main.state, ...update } }
    main.handleToggleAddProbeDiv()
    expect(main.state.addProbe).toBe(true)
    main.handleToggleAddProbeDiv()
    expect(main.state.addProbe).toBe(false)
  })

  it('<Main /> mounts with enabled probe', () => {
    const enabledProbe = { id: '2', name: 'enabled-probe', enable: true, notify: { enable: false }, control: false, chart: {} }
    const main = new RawPhMain({
      probes: [enabledProbe],
      ais: [],
      currentReading: [],
      macros: [],
      equipment: [],
      fetchPhProbes: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      calibrateProbe: jest.fn(),
      readProbe: jest.fn()
    })
    expect(main.probeList()).toHaveLength(1)
  })

  it('<Main /> mounts with control probe', () => {
    const controlProbe = {
      id: '3',
      name: 'control-probe',
      enable: false,
      notify: { enable: false },
      control: true,
      is_macro: false,
      min: 7,
      max: 8.6,
      downer_eq: '1',
      upper_eq: '2',
      chart: {}
    }
    const main = new RawPhMain({
      probes: [controlProbe],
      ais: [],
      currentReading: [],
      macros: [],
      equipment: [],
      fetchPhProbes: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      calibrateProbe: jest.fn(),
      readProbe: jest.fn()
    })
    expect(main.probeList()).toHaveLength(1)
  })

  it('<Main /> delete probe triggers confirm', async () => {
    const del = jest.fn()
    const main = new RawPhMain({
      probes: phState.phprobes,
      ais: [],
      currentReading: [],
      macros: [],
      equipment: [],
      fetchPhProbes: jest.fn(),
      create: jest.fn(),
      delete: del,
      update: jest.fn(),
      calibrateProbe: jest.fn(),
      readProbe: jest.fn()
    })
    main.handleDeleteProbe(phState.phprobes[0])
    await Promise.resolve()
    expect(del).toHaveBeenCalledWith('1')
  })

  it('<Main /> calibrate button click shows wizard', () => {
    const main = new RawPhMain({
      probes: phState.phprobes,
      ais: [],
      currentReading: [],
      macros: [],
      equipment: [],
      fetchPhProbes: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      calibrateProbe: jest.fn(),
      readProbe: jest.fn()
    })
    main.setState = update => { main.state = { ...main.state, ...update } }
    main.calibrateProbe({}, phState.phprobes[0])
    expect(main.state.showCalibrate).toBe(true)
    expect(main.state.currentProbe).toEqual(phState.phprobes[0])
  })

  it('<Main /> valuesToProbe and handlers', () => {
    const create = jest.fn()
    const update = jest.fn()
    const main = new RawPhMain({
      probes: [],
      ais: [],
      currentReading: [],
      macros: [],
      equipment: [],
      fetchPhProbes: jest.fn(),
      create,
      delete: jest.fn(),
      update,
      calibrateProbe: jest.fn(),
      readProbe: jest.fn()
    })
    main.setState = nextState => { main.state = { ...main.state, ...nextState } }
    const values = {
      id: '1',
      name: 'probe',
      enable: true,
      period: '60',
      analog_input: '2',
      notify: true,
      minAlert: '7.1',
      maxAlert: '8.6',
      chart: { ymin: 0, ymax: 14, color: '#000', unit: '' },
      control: 'macro',
      one_shot: false,
      lowerThreshold: '7',
      lowerFunction: '3',
      upperThreshold: '8.6',
      upperFunction: '1',
      transformer: '',
      hysteresis: '0.1',
      chart_y_min: '0',
      chart_y_max: '14'
    }
    const payload = main.valuesToProbe(values)
    expect(payload.control).toBe(true)
    expect(payload.is_macro).toBe(true)
    expect(payload.notify.min).toBe(7.1)
    main.handleUpdateProbe(values)
    main.handleCreateProbe(values)
    expect(update).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'probe' }))
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ name: 'probe' }))
  })

  it('<PhForm/> for create', () => {
    const fn = jest.fn()
    const values = mapPhPropsToValues({})
    submitPhForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalled()
    expect(PhForm).toBeDefined()
  })

  it('<PhForm /> for edit', () => {
    const fn = jest.fn()
    const probe = {
      id: '4',
      name: 'name',
      enable: true,
      address: 99,
      notify: { enable: false },
      control: true,
      is_macro: false,
      chart_y_min: 0,
      chart_y_max: 14
    }
    const values = mapPhPropsToValues({ probe })
    submitPhForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ name: 'name' }))
    expect(values.control).toBe('equipment')
  })

  it('<PhForm /> for edit with macro', () => {
    const probe = {
      name: 'name',
      enable: true,
      address: 99,
      notify: { enable: false },
      control: true,
      is_macro: true,
      chart_y_min: 0,
      chart_y_max: 14
    }
    const values = mapPhPropsToValues({ probe })
    expect(values.control).toBe('macro')
  })

  it('<PhForm /> for edit without control', () => {
    const probe = {
      name: 'name',
      enable: true,
      address: 99,
      notify: { enable: false },
      control: false,
      is_macro: true,
      chart_y_min: 0,
      chart_y_max: 14
    }
    const values = mapPhPropsToValues({ probe })
    expect(values.control).toBe('')
  })

  it('<Chart />', () => {
    const noConfig = new RawPhChart({ probe_id: '1', fetchProbeReadings: jest.fn(), config: undefined, readings: undefined })
    expect(noConfig.render().type).toBe('div')
    const withReadings = new RawPhChart({
      probe_id: '1',
      fetchProbeReadings: jest.fn(),
      config: { name: 'foo', chart: { color: '#000', ymin: 0, ymax: 14, unit: 'pH' }, notify: { enable: true, min: 7, max: 8.6 } },
      readings: { current: [{ time: '2026-04-26T00:00:00Z', value: 7.5 }, { time: '2026-04-26T01:00:00Z', value: 7.6 }] },
      type: 'current',
      height: 300
    })
    expect(withReadings.render().type).toBe('div')
    expect(Chart).toBeDefined()
  })
})
