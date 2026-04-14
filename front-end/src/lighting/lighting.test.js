import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Channel from './channel'
import { ChartView } from './chart'
import { MainView, TestMain } from './main'
import LightForm from './light_form'
import Light from './light'
import ProfileSelector from './profile_selector'
import AutoProfile from './auto_profile'
import DiurnalProfile from './diurnal_profile'
import FixedProfile from './fixed_profile'
import SineProfile from './sine_profile'
import RandomProfile from './random_profile'
import LunarProfile from './lunar_profile'
import Profile from './profile'
import Percent from '../ui_components/percent'
import IntervalChart from './charts/interval'
import FixedChart from './charts/fixed'
import DiurnalChart from './charts/diurnal'
import GenericLightChart from './charts/generic'
import * as Alert from '../utils/alert'
import 'isomorphic-fetch'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockResolvedValue(true)
}))

describe('Lighting ui', () => {
  const ev = {
    target: { value: 10.5 }
  }

  let light = {
    id: '1',
    name: 'foo',
    jack: '1',
    enable: true,
    channels: {
      1: {
        pin: 0,
        color: '',
        min: 0,
        max: 100,
        on: true,
        manual: false,
        profile: {
          type: 'interval',
          config: {
            start: '14:00:00',
            end: '22:00:00',
            values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          }
        }
      }
    }
  }

  beforeEach(() => {
    light = JSON.parse(JSON.stringify({
      id: '1',
      name: 'foo',
      jack: '1',
      enable: true,
      channels: {
        1: {
          pin: 0,
          color: '',
          min: 0,
          max: 100,
          on: true,
          manual: false,
          profile: {
            type: 'interval',
            config: {
              start: '14:00:00',
              end: '22:00:00',
              values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            }
          }
        }
      }
    }))
    jest.restoreAllMocks()
  })

  it('<MainView /> renders without throwing', () => {
    const view = new MainView({
      lights: [light, light],
      jacks: [{ id: '1', name: 'foo', pins: [1, 2] }],
      updateLight: jest.fn(),
      createLight: jest.fn(),
      deleteLight: jest.fn(),
      fetchLights: jest.fn(),
      fetchJacks: jest.fn()
    })
    expect(() => view.render()).not.toThrow()
  })

  it('<Main /> changes mode from auto to manual', async () => {
    const fn = jest.fn()
    const fnUpdateLight = jest.fn()
    const m = new TestMain({
      fetchLights: fn,
      fetchJacks: fn,
      lights: [light, light],
      updateLight: fnUpdateLight
    })

    await m.handleChangeMode(light)()
    expect(fnUpdateLight).toHaveBeenCalledTimes(1)
    const actualArgs = fnUpdateLight.mock.calls[0][1]
    expect(actualArgs.channels[1].manual).toBe(true)
  })

  it('<Main /> changes mode from manual to auto', async () => {
    const fn = jest.fn()
    const fnUpdateLight = jest.fn()
    light.channels[1].manual = true

    const m = new TestMain({
      fetchLights: fn,
      fetchJacks: fn,
      lights: [light, light],
      updateLight: fnUpdateLight
    })

    await m.handleChangeMode(light)()
    expect(fnUpdateLight).toHaveBeenCalledTimes(1)
    const actualArgs = fnUpdateLight.mock.calls[0][1]
    expect(actualArgs.channels[1].manual).toBe(false)
  })

  it('<Main /> changes mode from mixed to auto', async () => {
    const fn = jest.fn()
    const fnUpdateLight = jest.fn()

    light.channels[2] = JSON.parse(JSON.stringify(light.channels[1]))
    light.channels[2].manual = true

    const m = new TestMain({
      fetchLights: fn,
      fetchJacks: fn,
      lights: [light, light],
      updateLight: fnUpdateLight
    })

    await m.handleChangeMode(light)()
    const actualArgs = fnUpdateLight.mock.calls[0][1]
    expect(actualArgs.channels[1].manual).toBe(false)
    expect(actualArgs.channels[2].manual).toBe(false)
  })

  it('<Main /> computes interval when start is before end', () => {
    const fnUpdateLight = jest.fn()
    light.channels[1].profile.config.start = '14:00:00'
    light.channels[1].profile.config.end = '16:00:00'
    light.channels[1].profile.config.values = [1, 2, 3.6, 4, 5]
    const m = new TestMain({
      lights: [light],
      jacks: [],
      updateLight: fnUpdateLight
    })

    m.handleUpdateLight({ config: light })
    const payload = fnUpdateLight.mock.calls[0][1]
    expect(payload.channels[1].profile.config.interval).toBe(1800)
  })

  it('<Main /> computes interval when end is before start', () => {
    const fnUpdateLight = jest.fn()
    light.channels[1].profile.config.start = '23:00:00'
    light.channels[1].profile.config.end = '01:00:00'
    light.channels[1].profile.config.values = [1, 2, 3, 4, 5]
    const m = new TestMain({
      lights: [light],
      jacks: [],
      updateLight: fnUpdateLight
    })

    m.handleUpdateLight({ config: light })
    const payload = fnUpdateLight.mock.calls[0][1]
    expect(payload.channels[1].profile.config.interval).toBe(1800)
  })

  it('<LightForm /> renders without throwing', () => {
    expect(() => renderToStaticMarkup(<LightForm onSubmit={jest.fn()} config={light} />)).not.toThrow()
  })

  it('<Light /> submits successfully when valid', () => {
    const submitForm = jest.fn()
    const showUpdateSuccessful = jest.spyOn(Alert, 'showUpdateSuccessful').mockImplementation(() => {})
    const component = Light({
      values: { config: light },
      config: light,
      save: jest.fn(),
      remove: jest.fn(),
      submitForm,
      isValid: true,
      dirty: true,
      touched: {},
      errors: {},
      jacks: []
    })

    component.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(showUpdateSuccessful).toHaveBeenCalled()
  })

  it('<Light /> shows error on submit if not valid', () => {
    const submitForm = jest.fn()
    const showError = jest.spyOn(Alert, 'showError').mockImplementation(() => {})
    const component = Light({
      values: { config: light },
      config: light,
      save: jest.fn(),
      remove: jest.fn(),
      submitForm,
      isValid: false,
      dirty: true,
      touched: {},
      errors: {},
      jacks: []
    })

    component.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(showError).toHaveBeenCalled()
  })

  it('<ChartView /> picks interval, fixed, diurnal, and generic charts', () => {
    const interval = new ChartView({ config: light, width: 100, height: 100 }).render()
    expect(interval.type).toBe(IntervalChart)

    const fixedLight = JSON.parse(JSON.stringify(light))
    fixedLight.channels[1].profile.type = 'fixed'
    const fixed = new ChartView({ config: fixedLight, width: 100, height: 100 }).render()
    expect(fixed.type).toBe(FixedChart)

    const diurnalLight = JSON.parse(JSON.stringify(light))
    diurnalLight.channels[1].profile.type = 'diurnal'
    const diurnal = new ChartView({ config: diurnalLight, width: 100, height: 100 }).render()
    expect(diurnal.type).toBe(DiurnalChart)

    const genericLight = JSON.parse(JSON.stringify(light))
    genericLight.channels[1].profile.type = 'unknown'
    const generic = new ChartView({ config: genericLight, width: 100, height: 100 }).render()
    expect(generic.type).toBe(GenericLightChart)
  })

  it('<ChartView /> handles missing and multi-channel configs', () => {
    expect(new ChartView({ config: undefined }).render().type).toBe('span')
    const multi = JSON.parse(JSON.stringify(light))
    multi.channels[2] = JSON.parse(JSON.stringify(light.channels[1]))
    const rendered = new ChartView({ config: multi }).render()
    expect(rendered.props.children).toContain('multi channel light charts')
  })

  it('<Channel /> renders', () => {
    const tree = Channel({
      name: 'config.channels.1',
      channel: light.channels[1],
      channelNum: '1',
      onChangeHandler: () => {},
      onBlur: () => {},
      setTouched: () => {},
      touched: {},
      errors: {}
    })
    expect(tree).toBeDefined()
  })

  it('<Profile /> selects expected components', () => {
    expect(Profile({ name: 'name', type: 'fixed', onChangeHandler: jest.fn() }).type).toBe(FixedProfile)
    expect(Profile({ name: 'name', type: 'interval', onChangeHandler: jest.fn() }).type).toBe(AutoProfile)
    expect(Profile({ name: 'name', type: 'diurnal', onChangeHandler: jest.fn() }).type).toBe(DiurnalProfile)
  })

  it('<DiurnalProfile /> renders', () => {
    const tree = DiurnalProfile({ name: 'testDiurnal', onChangeHandler: () => true, touched: {}, errors: {} })
    expect(tree).toBeDefined()
  })

  it('<FixedProfile /> handles valid and empty values', () => {
    const onChangeHandler = jest.fn()
    const m = new FixedProfile({
      name: 'fixed',
      onChangeHandler,
      config: { start: '10:00:00', end: '12:00:00', value: '1' }
    })
    m.setState = jest.fn(update => {
      m.state = { ...m.state, ...update }
    })
    m.handleChange(ev)
    m.handleChange({ target: { value: '' } })
    expect(onChangeHandler).toHaveBeenCalled()
  })

  it('<SineProfile /> renders', () => {
    const config = { config: { value: '1' } }
    const tree = SineProfile({ name: 'testsine', config, readOnly: false, onChangeHandler: () => {} })
    expect(tree).toBeDefined()
  })

  it('<RandomProfile /> renders', () => {
    const config = { config: { value: '1' } }
    const tree = RandomProfile({ name: 'testrandom', config, readOnly: false, onChangeHandler: () => {} })
    expect(tree).toBeDefined()
  })

  it('<LunarProfile /> renders', () => {
    const config = { config: { value: '1' } }
    const tree = LunarProfile({ name: 'testLunar', config, readOnly: false, onChangeHandler: () => {}, touched: {}, errors: {} })
    expect(tree).toBeDefined()
  })

  it('<Percent /> converts numeric input', () => {
    const onChange = jest.fn()
    const component = Percent({ value: '4', onChange })
    component.props.onChange({ target: { name: 'x', value: 34 } })
    expect(onChange).toHaveBeenCalledWith({ target: { name: 'x', value: 34 } })
  })

  it('<ProfileSelector /> routes change through provided handler', () => {
    const fn = jest.fn()
    const component = ProfileSelector({ name: 'name', value: 'fixed', onChangeHandler: fn })
    const mobileSelect = component.props.children[0].props.children
    expect(renderToStaticMarkup(component)).toContain('type="radio"')
    mobileSelect.props.onChange({ target: { name: 'ignored', value: 'diurnal' } })
    expect(fn).toHaveBeenCalled()
    expect(fn.mock.calls[0][0].target.name).toBe('name')
    expect(fn.mock.calls[0][0].target.value).toBe('diurnal')
  })
})
