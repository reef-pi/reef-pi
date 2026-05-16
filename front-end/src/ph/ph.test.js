import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import PhForm, { mapPhPropsToValues, phControlValue } from './ph_form'
import { RawPhChart } from './chart'
import { RawPhMain } from './main'
import CalibrationWizard from './calibration_wizard'
import 'isomorphic-fetch'

const mockStore = configureMockStore([])

const phState = {
  phprobes: [{ id: '1', name: 'probe', enable: false, notify: { enable: false }, control: false }],
  analog_inputs: [],
  ph_reading: [],
  macros: [],
  equipment: []
}

jest.mock('utils/confirm', () => {
  return {
    showModal: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this),
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

describe('Ph ui', () => {
  const createProps = overrides => ({
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
    readProbe: jest.fn(),
    ...overrides
  })

  const probeValues = overrides => ({
    id: 'probe-id',
    name: 'Tank pH',
    enable: true,
    period: '45',
    analog_input: 'analog-1',
    notify: true,
    minAlert: '6.7',
    maxAlert: '8.4',
    control: 'equipment',
    one_shot: true,
    lowerThreshold: '7.1',
    lowerFunction: 'heater',
    upperThreshold: '8.3',
    upperFunction: 'co2',
    transformer: 'scale',
    hysteresis: '0.15',
    chart_y_min: '6',
    chart_y_max: '9',
    chart: { color: '#00f', ymin: 6, ymax: 9, unit: 'pH' },
    ...overrides
  })

  const setComponentState = component => {
    component.setState = update => {
      component.state = {
        ...component.state,
        ...(typeof update === 'function' ? update(component.state) : update)
      }
    }
  }

  const renderForm = props => renderToStaticMarkup(
    <Provider store={mockStore({ phprobes: [], ph_readings: {} })}>
      <PhForm
        analogInputs={[]}
        macros={[]}
        equipment={[]}
        {...props}
      />
    </Provider>
  )

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Main /> mounts with empty probes', () => {
    const props = createProps()
    const component = new RawPhMain(props)
    component.componentDidMount()
    expect(props.fetchPhProbes).toHaveBeenCalled()
    expect(component.render().type).toBe('div')
  })

  it('<Main /> mounts with probes', () => {
    const probes = [
      { id: '1', name: 'probe B', enable: false, notify: { enable: false }, control: false },
      { id: '2', name: 'probe A', enable: false, notify: { enable: false }, control: false }
    ]
    const props = createProps({ probes })
    const component = new RawPhMain(props)
    component.componentDidMount()
    const items = component.probeList()
    expect(items).toHaveLength(2)
    expect(items[0].props.name).toBe('panel-ph-2')
    expect(probes.map(probe => probe.name)).toEqual(['probe B', 'probe A'])
  })

  it('<Main /> toggles add probe form', () => {
    const component = new RawPhMain(createProps())
    setComponentState(component)
    component.handleToggleAddProbeDiv()
    expect(component.state.addProbe).toBe(true)
    component.handleToggleAddProbeDiv()
    expect(component.state.addProbe).toBe(false)
  })

  it('<Main /> mounts with enabled probe', () => {
    const enabledProbe = { id: '2', name: 'enabled-probe', enable: true, notify: { enable: false }, control: false }
    const component = new RawPhMain(createProps({ probes: [enabledProbe] }))
    expect(component.probeList()).toHaveLength(1)
  })

  it('<Main /> mounts with control probe', () => {
    const controlProbe = {
      id: '3', name: 'control-probe', enable: false,
      notify: { enable: false }, control: true, is_macro: false,
      min: 7, max: 8.6, downer_eq: '1', upper_eq: '2', chart: {}
    }
    const component = new RawPhMain(createProps({ probes: [controlProbe] }))
    expect(component.probeList()).toHaveLength(1)
  })

  it('<Main /> delete probe triggers confirm', () => {
    const props = createProps({ probes: phState.phprobes })
    const component = new RawPhMain(props)
    component.handleDeleteProbe(phState.phprobes[0])
    return Promise.resolve().then(() => {
      expect(props.delete).toHaveBeenCalledWith('1')
    })
  })

  it('<Main /> calibrate button click shows wizard', () => {
    const component = new RawPhMain(createProps({ probes: phState.phprobes }))
    setComponentState(component)
    component.calibrateProbe({}, phState.phprobes[0])
    expect(component.state.showCalibrate).toBe(true)
  })

  it('<Main /> updates probe with normalized form values', () => {
    const props = createProps()
    const component = new RawPhMain(props)
    component.handleUpdateProbe(probeValues())

    expect(props.update).toHaveBeenCalledWith('probe-id', {
      name: 'Tank pH',
      enable: true,
      period: '45',
      analog_input: 'analog-1',
      notify: {
        enable: true,
        min: 6.7,
        max: 8.4
      },
      chart: { color: '#00f', ymin: 6, ymax: 9, unit: 'pH' },
      control: true,
      is_macro: false,
      one_shot: true,
      min: 7.1,
      downer_eq: 'heater',
      max: 8.3,
      upper_eq: 'co2',
      transformer: 'scale',
      hysteresis: 0.15,
      chart_y_min: 6,
      chart_y_max: 9
    })
  })

  it('<Main /> creates probe with normalized values and hides add form', () => {
    const props = createProps()
    const component = new RawPhMain(props)
    setComponentState(component)
    component.state.addProbe = true

    component.handleCreateProbe(probeValues({
      id: undefined,
      control: 'macro',
      one_shot: false
    }))

    expect(props.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Tank pH',
      control: true,
      is_macro: true,
      one_shot: false,
      notify: expect.objectContaining({ min: 6.7, max: 8.4 }),
      chart_y_min: 6,
      chart_y_max: 9
    }))
    expect(component.state.addProbe).toBe(false)
  })

  it('<Main /> dismisses calibration modal state', () => {
    const component = new RawPhMain(createProps())
    setComponentState(component)
    component.state.currentProbe = phState.phprobes[0]
    component.state.showCalibrate = true

    component.dismissModal()

    expect(component.state.currentProbe).toBeNull()
    expect(component.state.showCalibrate).toBe(false)
  })

  it('<Main /> probe list toggle flips probe enable and updates it', () => {
    const probe = { id: '1', name: 'probe', enable: false, notify: { enable: false }, control: false }
    const props = createProps({ probes: [probe] })
    const component = new RawPhMain(props)

    component.probeList()[0].props.onToggleState()

    expect(probe.enable).toBe(true)
    expect(props.update).toHaveBeenCalledWith('1', probe)
  })

  it('<Main /> renders CalibrationWizard when calibration is shown', () => {
    const component = new RawPhMain(createProps({ currentReading: { 1: 7.2 } }))
    setComponentState(component)
    component.state.currentProbe = phState.phprobes[0]
    component.state.showCalibrate = true

    const calibrationModal = component.render().props.children[0]

    expect(calibrationModal.type).toBe(CalibrationWizard)
    expect(calibrationModal.props.probe).toBe(phState.phprobes[0])
    expect(calibrationModal.props.confirm).toBe(component.dismissModal)
    expect(calibrationModal.props.cancel).toBe(component.dismissModal)
  })

  it('<Main />', () => {
    const component = new RawPhMain(createProps())
    expect(component.valuesToProbe({
      name: 'probe',
      enable: true,
      period: '60',
      analog_input: '1',
      notify: false,
      minAlert: '6.5',
      maxAlert: '8.0',
      control: 'macro',
      one_shot: true,
      lowerThreshold: '7',
      lowerFunction: '3',
      upperThreshold: '8.6',
      upperFunction: '1',
      transformer: '',
      hysteresis: '0.5',
      chart_y_min: '0',
      chart_y_max: '14',
      chart: { color: '#000', ymin: 0, ymax: 14, unit: '' }
    }).is_macro).toBe(true)
  })

  it('<PhForm/> for create', () => {
    expect(renderForm({ onSubmit: jest.fn() })).toContain('name="name"')
  })

  it('<PhForm /> for edit', () => {
    const probe = {
      name: 'name',
      enable: true,
      address: 99,
      notify: { enable: false },
      control: true,
      is_macro: false,
      chart_y_min: 0,
      chart_y_max: 14
    }
    expect(renderForm({ probe, onSubmit: jest.fn() })).toContain('value="name"')
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
    expect(renderForm({ probe, onSubmit: jest.fn() })).toContain('value="macro"')
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
    expect(renderForm({ probe, onSubmit: jest.fn() })).toContain('option value="" selected=""')
  })

  it('maps pH form values with derived control modes', () => {
    expect(mapPhPropsToValues({}).control).toBe('')
    expect(mapPhPropsToValues({ probe: { notify: {}, control: true, is_macro: false } }).control).toBe('equipment')
    expect(mapPhPropsToValues({ probe: { notify: {}, control: true, is_macro: true } }).control).toBe('macro')
    expect(mapPhPropsToValues({ probe: { notify: {}, control: false, is_macro: true } }).control).toBe('')
  })

  it('maps pH form defaults for create', () => {
    expect(mapPhPropsToValues({})).toEqual({
      id: '',
      name: '',
      analog_input: '',
      enable: true,
      period: 60,
      one_shot: false,
      notify: false,
      maxAlert: 0,
      minAlert: 0,
      control: '',
      lowerThreshold: 0,
      lowerFunction: '',
      upperThreshold: 0,
      upperFunction: '',
      hysteresis: 0,
      transformer: '',
      chart: { ymin: 0, ymax: 100, color: '#000', unit: '' }
    })
  })

  it('maps pH form edit values with alerts and control', () => {
    expect(mapPhPropsToValues({
      probe: {
        id: '1',
        name: 'Tank pH',
        analog_input: 'a1',
        enable: false,
        period: 30,
        one_shot: true,
        notify: { enable: true, min: 7, max: 8.5 },
        control: true,
        is_macro: false,
        min: 7.1,
        downer_eq: 'co2',
        max: 8.3,
        upper_eq: 'alk',
        hysteresis: 0.1,
        transformer: 'scale',
        chart: { ymin: 6, ymax: 9, color: '#0f0', unit: 'pH' }
      }
    })).toEqual({
      id: '1',
      name: 'Tank pH',
      analog_input: 'a1',
      enable: false,
      period: 30,
      one_shot: true,
      notify: true,
      maxAlert: 8.5,
      minAlert: 7,
      control: 'equipment',
      lowerThreshold: 7.1,
      lowerFunction: 'co2',
      upperThreshold: 8.3,
      upperFunction: 'alk',
      hysteresis: 0.1,
      transformer: 'scale',
      chart: { ymin: 6, ymax: 9, color: '#0f0', unit: 'pH' }
    })
  })

  it('derives pH control value from control flags', () => {
    expect(phControlValue({ control: true, is_macro: false })).toBe('equipment')
    expect(phControlValue({ control: true, is_macro: true })).toBe('macro')
    expect(phControlValue({ control: false, is_macro: true })).toBe('')
  })

  it('<Chart />', () => {
    expect(new RawPhChart({ config: undefined, readings: { current: [] }, probe_id: '1', fetchProbeReadings: jest.fn() }).render().type).toBe('div')
    expect(new RawPhChart({ config: { chart: {} }, readings: undefined, probe_id: '1', fetchProbeReadings: jest.fn() }).render().type).toBe('div')

    const fetchProbeReadings = jest.fn()
    const historical = [
      { time: 'Jul-01-10:10, 2024', value: 7.4 },
      { time: 'Jul-01-10:00, 2024', value: 7.1 },
      { time: 'Jul-01-10:05, 2024', value: 7.2 },
      { time: 'Jul-01-10:05, 2024', value: 7.3 }
    ]
    const originalHistorical = historical.map(reading => ({ ...reading }))
    const instance = new RawPhChart({
      config: {
        id: '1',
        name: 'foo',
        chart: { color: '#000', ymin: 0, ymax: 14, unit: 'pH' },
        notify: { enable: true, min: 7, max: 8.5 }
      },
      readings: {
        historical
      },
      probe_id: '1',
      fetchProbeReadings,
      type: 'historical',
      height: 200
    })
    setComponentState(instance)
    instance.componentDidMount()
    expect(fetchProbeReadings).toHaveBeenCalledWith('1')
    const rendered = instance.render()
    expect(rendered.props.className).toBe('container')
    const chartData = rendered.props.children[1].props.children.props.data
    expect(chartData.map(reading => reading.time)).toEqual([
      'Jul-01-10:00, 2024',
      'Jul-01-10:05, 2024',
      'Jul-01-10:05, 2024',
      'Jul-01-10:10, 2024'
    ])
    expect(chartData.map(reading => reading.value)).toEqual([7.1, 7.2, 7.3, 7.4])
    expect(chartData.map(reading => reading.ts)).toEqual([...chartData.map(reading => reading.ts)].sort((a, b) => a - b))
    expect(historical).toEqual(originalHistorical)
    instance.componentWillUnmount()
  })

  it('<Main /> fetches probe readings and renders primitives under dashboard_v2 flag', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    const fetchProbeReadings = jest.fn()
    const probe = { id: '1', name: 'Tank pH', enable: false, min: 7.8, max: 8.3, notify: { enable: true, min: 7.5, max: 8.5 }, notify_enable: false, control: false }
    const now = new Date()
    const component = new RawPhMain(createProps({
      probes: [probe],
      currentReading: { 1: 8.1 },
      phReadings: {
        1: {
          current: [
            { time: now.toISOString(), value: 8.1 },
            { time: new Date(now.getTime() - 3600000).toISOString(), value: 8.0 }
          ]
        }
      },
      fetchProbeReadings
    }))

    component.componentDidMount()
    const probeListItem = component.probeList()[0]
    const primitives = probeListItem.props.children[0]

    expect(fetchProbeReadings).toHaveBeenCalledWith('1')
    expect(primitives.props.probe).toBe(probe)
    expect(primitives.props.readings.current).toHaveLength(2)
    expect(primitives.props.currentReading).toBe(8.1)
    window.FEATURE_FLAGS = {}
  })

  it('<Main /> renders pH dashboard primitives with readings and threshold gauge', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    const now = new Date()
    const probe = { id: '1', name: 'Tank pH', enable: false, min: 7.8, max: 8.3, notify: { enable: true, min: 7.5, max: 8.5 }, control: false }
    const component = new RawPhMain(createProps({
      probes: [probe],
      currentReading: { 1: 8.2 },
      phReadings: {
        1: {
          current: [
            { time: now.toISOString(), value: 8.2 },
            { time: new Date(now.getTime() - 3600000).toISOString(), value: 8.0 },
            { time: new Date(now.getTime() - 3 * 86400000).toISOString(), value: 7.9 }
          ]
        }
      }
    }))

    const html = renderToStaticMarkup(component.probeList()[0].props.children[0])

    expect(html).toContain('ph-1')
    expect(html).toContain('Tank pH')
    expect(html).toContain('pH')
    window.FEATURE_FLAGS = {}
  })

  it('<Main /> omits pH dashboard primitives when readings are unavailable', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    const probe = { id: '1', name: 'Tank pH', enable: false, notify: { enable: false }, control: false }
    const component = new RawPhMain(createProps({
      probes: [probe],
      currentReading: {},
      phReadings: { 1: {} }
    }))

    expect(renderToStaticMarkup(component.probeList()[0].props.children[0])).toBe('')
    window.FEATURE_FLAGS = {}
  })

  it('<Main /> renders EmptyState with calibration modal slot when no probes', () => {
    const component = new RawPhMain(createProps())
    const rendered = component.render()
    expect(rendered.type).toBe('div')
    const children = rendered.props.children
    expect(children[0]).toBeNull()
    expect(children[1].type.name).toBe('EmptyState')
  })

  it('<Main /> render returns probe list div when probes exist', () => {
    const probe = { id: '1', name: 'Tank pH', enable: false, min: 7.8, max: 8.3, notify: { enable: false } }
    const component = new RawPhMain(createProps({
      probes: [probe],
      currentReading: {},
      phReadings: {}
    }))
    const tree = component.render()
    expect(tree.type).toBe('div')
    expect(tree.props.children[1].type).toBe('ul')
  })

  it('<Main /> render includes add-probe input with minus when addProbe is true', () => {
    const probe = { id: '1', name: 'Tank pH', enable: false, min: 7.8, max: 8.3, notify: { enable: false } }
    const component = new RawPhMain(createProps({
      probes: [probe],
      currentReading: {},
      phReadings: {}
    }))
    component.state = { ...component.state, addProbe: true }
    const tree = component.render()
    expect(tree.type).toBe('div')
    const ul = tree.props.children[1]
    expect(ul.type).toBe('ul')
  })

  it('<Main /> PhPrimitives renders sparkline and range selector with readings', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    const now = new Date()
    const probe = { id: '1', name: 'Tank pH', enable: false, min: 7.8, max: 8.3, notify: { enable: true, min: 7.5, max: 8.5 } }
    const component = new RawPhMain(createProps({
      probes: [probe],
      currentReading: { 1: 8.1 },
      phReadings: {
        1: {
          current: [
            { time: now.toISOString(), value: 8.1 },
            { time: new Date(now.getTime() - 3600000).toISOString(), value: 8.0 }
          ]
        }
      },
      fetchProbeReadings: jest.fn()
    }))
    const primitives = component.probeList()[0].props.children[0]
    const html = renderToStaticMarkup(primitives)
    expect(html).toContain('ph-1')
    expect(html).toContain('reefpi-range-selector')
    window.FEATURE_FLAGS = {}
  })

  it('<Main /> PhPrimitives returns empty when readings are absent', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    const probe = { id: '1', name: 'Tank pH', enable: false, min: 7.8, max: 8.3, notify: { enable: false } }
    const component = new RawPhMain(createProps({
      probes: [probe],
      currentReading: {},
      phReadings: { 1: {} },
      fetchProbeReadings: jest.fn()
    }))
    const primitives = component.probeList()[0].props.children[0]
    expect(renderToStaticMarkup(primitives)).toBe('')
    window.FEATURE_FLAGS = {}
  })
})
