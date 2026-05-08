import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import PhForm, { mapPhPropsToValues, phControlValue } from './ph_form'
import { RawPhChart } from './chart'
import { RawPhMain } from './main'
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

  it('derives pH control value from control flags', () => {
    expect(phControlValue({ control: true, is_macro: false })).toBe('equipment')
    expect(phControlValue({ control: true, is_macro: true })).toBe('macro')
    expect(phControlValue({ control: false, is_macro: true })).toBe('')
  })

  it('<Chart />', () => {
    expect(new RawPhChart({ config: undefined, readings: { current: [] }, probe_id: '1', fetchProbeReadings: jest.fn() }).render().type).toBe('div')
    expect(new RawPhChart({ config: { chart: {} }, readings: undefined, probe_id: '1', fetchProbeReadings: jest.fn() }).render().type).toBe('div')

    const fetchProbeReadings = jest.fn()
    const instance = new RawPhChart({
      config: {
        id: '1',
        name: 'foo',
        chart: { color: '#000', ymin: 0, ymax: 14, unit: 'pH' },
        notify: { enable: true, min: 7, max: 8.5 }
      },
      readings: {
        current: [
          { time: '2026-04-27T10:00:00Z', value: 7.1 },
          { time: '2026-04-27T10:10:00Z', value: 7.2 }
        ]
      },
      probe_id: '1',
      fetchProbeReadings,
      type: 'current',
      height: 200
    })
    setComponentState(instance)
    instance.componentDidMount()
    expect(fetchProbeReadings).toHaveBeenCalledWith('1')
    expect(instance.render().props.className).toBe('container')
    instance.componentWillUnmount()
  })
})
