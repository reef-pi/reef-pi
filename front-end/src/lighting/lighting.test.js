import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Formik, Form } from 'formik'
import Channel from './channel'
import { RawLightingChart } from './chart'
import { TestMain } from './main'
import LightForm from './light_form'
import Light from './light'
import ProfileSelector from './profile_selector'
import AutoProfile from './auto_profile'
import DiurnalProfile from './diurnal_profile'
import FixedProfile from './fixed_profile'
import SineProfile from './sine_profile'
import RandomProfile from './random_profile'
import LunarProfile from './lunar_profile'
import CircadianProfile from './circadian_profile'
import CyclicProfile from './cyclic_profile'
import Profile from './profile'
import Percent from '../ui_components/percent'
import * as Alert from 'utils/alert'
import 'isomorphic-fetch'

const wrapFormik = (component, initialValues = {}) => renderToStaticMarkup(
  <Formik initialValues={initialValues} onSubmit={() => {}}>
    <Form>{component}</Form>
  </Formik>
)

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
        manual: false,
        min: 0,
        max: 100,
        profile: {
          type: 'interval',
          config: {
            start: '14:00:00',
            end: '22:00:00',
            values: [1, 2, 3, 4, 5, 6.4, 7, 8, 9, 10, 11, 12]
          }
        }
      }
    }
  }

  const createMain = overrides => new TestMain({
    fetchLights: jest.fn(),
    fetchJacks: jest.fn(),
    lights: [light, light],
    jacks: [{ id: '1', name: 'foo', pins: [1, 2] }],
    updateLight: jest.fn(),
    createLight: jest.fn(),
    deleteLight: jest.fn(),
    ...overrides
  })

  beforeEach(() => {
    light = {
      id: '1',
      name: 'foo',
      jack: '1',
      enable: true,
      channels: {
        1: {
          pin: 0,
          color: '',
          manual: false,
          min: 0,
          max: 100,
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
    jest.spyOn(Alert, 'showError')
    jest.spyOn(Alert, 'showUpdateSuccessful')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Main />', () => {
    const m = createMain()
    expect(m.lightsList()).toHaveLength(2)
  })

  it('<Main /> should change mode from auto to manual', () => {
    const fnUpdateLight = jest.fn()
    const m = createMain({ updateLight: fnUpdateLight })

    expect.assertions(2)
    return m.handleChangeMode(light)().then(() => {
      expect(fnUpdateLight).toHaveBeenCalledTimes(1)
      expect(fnUpdateLight.mock.calls[0][1].channels[1].manual).toBe(true)
    })
  })

  it('<Main /> should change mode from manual to auto', () => {
    const fnUpdateLight = jest.fn()
    light.channels[1].manual = true
    const m = createMain({ updateLight: fnUpdateLight })

    expect.assertions(2)
    return m.handleChangeMode(light)().then(() => {
      expect(fnUpdateLight).toHaveBeenCalledTimes(1)
      expect(fnUpdateLight.mock.calls[0][1].channels[1].manual).toBe(false)
    })
  })

  it('<Main /> should change mode from mixed to auto', () => {
    const fnUpdateLight = jest.fn()
    light.channels[2] = {
      pin: 1,
      color: '',
      manual: true,
      min: 0,
      max: 100,
      profile: {
        type: 'interval',
        config: {
          start: '14:00:00',
          end: '22:00:00',
          values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        }
      }
    }
    const m = createMain({ updateLight: fnUpdateLight })

    expect.assertions(3)
    return m.handleChangeMode(light)().then(() => {
      expect(fnUpdateLight).toHaveBeenCalledTimes(1)
      expect(fnUpdateLight.mock.calls[0][1].channels[1].manual).toBe(false)
      expect(fnUpdateLight.mock.calls[0][1].channels[2].manual).toBe(false)
    })
  })

  it('<Main /> should set the interval when start is before end', () => {
    const fnUpdateLight = jest.fn()
    light.channels[1].profile.config.start = '14:00:00'
    light.channels[1].profile.config.end = '16:00:00'
    light.channels[1].profile.config.values = [1, 2, 3.6, 4, 5]
    const m = createMain({ updateLight: fnUpdateLight })

    m.handleUpdateLight({
      config: {
        id: 1,
        name: 'light',
        channels: light.channels,
        jack: light.jack
      }
    })

    expect(fnUpdateLight).toHaveBeenCalledTimes(1)
    expect(fnUpdateLight.mock.calls[0][1].channels[1].profile.config.interval).toBe(30 * 60)
  })

  it('<Main /> should set the interval when end is before start', () => {
    const fnUpdateLight = jest.fn()
    light.channels[1].profile.type = 'auto'
    light.channels[1].profile.config.start = '23:00:00'
    light.channels[1].profile.config.end = '01:00:00'
    light.channels[1].profile.config.values = [1, 2, 3, 4, 5]
    const m = createMain({ updateLight: fnUpdateLight })

    m.handleUpdateLight({
      config: {
        id: 1,
        name: 'light',
        channels: light.channels,
        jack: light.jack
      }
    })

    expect(fnUpdateLight).toHaveBeenCalledTimes(1)
    expect(fnUpdateLight.mock.calls[0][1].channels[1].profile.config.interval).toBe(30 * 60)
  })

  it('<LightForm />', () => {
    light.channels[2] = {
      pin: 1,
      color: '',
      min: 0,
      max: 100,
      profile: {
        type: 'interval',
        config: {
          start: '14:00:00',
          end: '22:00:00',
          values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        }
      }
    }
    expect(renderToStaticMarkup(
      <LightForm onSubmit={jest.fn()} config={light} jacks={[{ id: '1', name: 'foo' }]} />
    )).toContain('form-light-1')
  })

  it('<Light /> should submit', () => {
    const fn = jest.fn()
    const values = { config: light }
    const form = Light({
      values,
      config: light,
      save: () => {},
      remove: () => true,
      submitForm: fn,
      isValid: true,
      dirty: true,
      jacks: [{ id: '1', name: 'foo' }],
      touched: {},
      errors: {},
      handleBlur: jest.fn(),
      handleChange: jest.fn()
    })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(fn).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
  })

  it('<Light /> should show error on submit if not valid', () => {
    const fn = jest.fn()
    const values = { config: light }
    const form = Light({
      values,
      config: light,
      save: () => {},
      remove: () => true,
      submitForm: fn,
      isValid: false,
      dirty: true,
      jacks: [{ id: '1', name: 'foo' }],
      touched: {},
      errors: {},
      handleBlur: jest.fn(),
      handleChange: jest.fn()
    })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(fn).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<Chart />', () => {
    expect(new RawLightingChart({ config: undefined, light_id: '1' }).render().type).toBe('span')
    expect(new RawLightingChart({ config: light, light_id: '1', width: 100, height: 100 }).render().type).toBeDefined()
  })

  it('<Channel />', () => {
    expect(wrapFormik(
      <Channel
        name='config.channels.1'
        channel={light.channels['1']}
        channelNum='1'
        onChangeHandler={() => {}}
        onBlur={() => {}}
        touched={{}}
        errors={{}}
      />,
      { config: light }
    )).toContain('channel_name')
  })

  it('<Profile /> fixed', () => {
    expect(Profile({ name: 'name', type: 'fixed', onChangeHandler: jest.fn() }).type).toBe(FixedProfile)
  })

  it('<Profile /> interval', () => {
    expect(Profile({ name: 'name', type: 'interval', onChangeHandler: () => true }).type).toBe(AutoProfile)
  })

  it('<Profile /> diurnal', () => {
    expect(Profile({ name: 'name', type: 'diurnal', onChangeHandler: () => true }).type).toBe(DiurnalProfile)
  })

  it('<DiurnalProfile />', () => {
    expect(wrapFormik(
      <DiurnalProfile name='testDiurnal' onChangeHandler={() => true} touched={{}} errors={{}} />
    )).toContain('start_time')
  })

  it('<FixedProfile />', () => {
    const onChangeHandler = jest.fn()
    const m = new FixedProfile({ onChangeHandler, config: { value: '1' } })
    m.setState = update => { m.state = { ...m.state, ...update } }
    m.handleChange(ev)
    m.handleChange({ target: { value: 'foo' } })
    expect(onChangeHandler).toHaveBeenCalled()
  })

  it('<FixedProfile /> should not allow empty value', () => {
    const onChangeHandler = jest.fn()
    const m = new FixedProfile({ onChangeHandler, config: { value: '1' } })
    m.setState = update => { m.state = { ...m.state, ...update } }
    m.handleChange({ target: { value: '' } })
    expect(onChangeHandler).toHaveBeenCalledWith({
      start: undefined,
      end: undefined,
      value: ''
    })
  })

  it('<SineProfile />', () => {
    const config = { config: { value: '1' } }
    expect(wrapFormik(
      <SineProfile
        name='testsine'
        config={config}
        readOnly={false}
        onChangeHandler={() => {}}
      />,
      { testsine: { start: '08:00:00', end: '20:00:00' } }
    )).toContain('start_time')
  })

  it('<RandomProfile />', () => {
    const config = { config: { value: '1' } }
    expect(wrapFormik(
      <RandomProfile
        name='testrandom'
        config={config}
        readOnly={false}
        onChangeHandler={() => {}}
      />,
      { testrandom: { start: '08:00:00', end: '20:00:00' } }
    )).toContain('start_time')
  })

  it('<LunarProfile />', () => {
    const config = { config: { value: '1' } }
    expect(wrapFormik(
      <LunarProfile
        name='testLunar'
        config={config}
        readOnly={false}
        onChangeHandler={() => {}}
      />,
      { testLunar: { start: '08:00:00', end: '20:00:00', full_moon: null } }
    )).toContain('full_moon')
  })

  it('<Percent />', () => {
    const onChange = jest.fn()
    const field = Percent({ value: '4', onChange, name: 'foo' })
    field.props.onChange({ target: { name: 'foo', value: 34 } })
    expect(onChange).toHaveBeenCalledWith({ target: { name: 'foo', value: 34 } })
  })

  it('<ProfileSelector />', () => {
    const fn = jest.fn()
    const selector = ProfileSelector({ name: 'name', value: 'fixed', onChangeHandler: fn })
    expect(React.Children.count(selector.props.children[1].props.children)).toBe(10)
    selector.props.children[0].props.children.props.onChange({ target: { value: 'diurnal' } })
    expect(fn).toHaveBeenCalled()
  })

  it('<Profile /> circadian', () => {
    expect(Profile({ name: 'name', type: 'circadian', onChangeHandler: () => true }).type).toBe(CircadianProfile)
  })

  it('<Profile /> cyclic', () => {
    expect(Profile({ name: 'name', type: 'cyclic', onChangeHandler: () => true }).type).toBe(CyclicProfile)
  })

  it('<CircadianProfile />', () => {
    expect(wrapFormik(
      <CircadianProfile
        name='channels[1].profile.config'
        onChangeHandler={() => {}}
        readOnly={false}
        touched={{}}
        errors={{}}
      />,
      { 'channels[1].profile.config': { start: '08:00:00', end: '20:00:00', dawn_value: 10, noon_value: 80 } }
    )).toContain('circadian_dawn_value')
  })

  it('<CircadianProfile /> readOnly', () => {
    expect(wrapFormik(
      <CircadianProfile name='circadian' onChangeHandler={() => {}} readOnly touched={{}} errors={{}} />,
      {}
    )).toContain('readOnly=""')
  })

  it('<CyclicProfile />', () => {
    expect(wrapFormik(
      <CyclicProfile
        name='channels[1].profile.config'
        onChangeHandler={() => {}}
        readOnly={false}
        touched={{}}
        errors={{}}
      />,
      { 'channels[1].profile.config': { period: 3600, phase_shift: 0 } }
    )).toContain('cyclic_period')
  })

  it('<CyclicProfile /> readOnly', () => {
    expect(wrapFormik(
      <CyclicProfile name='cyclic' onChangeHandler={() => {}} readOnly touched={{}} errors={{}} />,
      {}
    )).toContain('readOnly=""')
  })
})
