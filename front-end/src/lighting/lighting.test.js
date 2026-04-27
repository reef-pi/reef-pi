import React from 'react'
import Channel from './channel'
import { RawChart } from './chart'
import Main, { TestMain } from './main'
import LightForm, { mapLightPropsToValues, submitLightForm } from './light_form'
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
import 'isomorphic-fetch'
import { showError, showUpdateSuccessful } from 'utils/alert'
import IntervalChart from './charts/interval'

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

jest.mock('utils/alert', () => ({
  showError: jest.fn(),
  showUpdateSuccessful: jest.fn()
}))

describe('Lighting ui', () => {
  const flattenElements = (node) => {
    const elements = []
    const visit = child => {
      if (!child) {
        return
      }
      if (Array.isArray(child)) {
        child.forEach(visit)
        return
      }
      elements.push(child)
      if (child.props && child.props.children) {
        visit(child.props.children)
      }
    }
    visit(node)
    return elements
  }

  const findByType = (node, type) => {
    return flattenElements(node).filter(element => element.type === type)
  }

  const ev = {
    target: { value: 10.5 }
  }
  let light = {
    id: '1',
    name: 'foo',
    jack: '1',
    channels: {
      1: {
        pin: 0,
        color: '',
        manual: false,
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

  beforeEach(() => {
    light = {
      id: '1',
      name: 'foo',
      jack: '1',
      channels: {
        1: {
          pin: 0,
          color: '',
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
  })

  it('<Main />', () => {
    const jacks = [{ id: '1', name: 'foo', pins: [1,2] }]
    const m = new TestMain({
      lights: [light, light],
      jacks,
      fetchLights: jest.fn(),
      fetchJacks: jest.fn(),
      updateLight: jest.fn(),
      createLight: jest.fn(),
      deleteLight: jest.fn()
    })
    expect(Main).toBeDefined()
    expect(m.render().type).toBe('ul')
  })

  it('<Main /> should change mode from auto to manual', () => {
    const fn = jest.fn()
    const fnUpdateLight = jest.fn()

    const m = new TestMain({
      fetchLights: fn,
      fetchJacks: fn,
      lights: [light, light],
      updateLight: fnUpdateLight
    })

    expect.assertions(2)
    return (m.handleChangeMode(light)()).then(() => {

      expect(fnUpdateLight).toHaveBeenCalledTimes(1)
      const actualArgs = fnUpdateLight.mock.calls[0][1]
      expect(actualArgs.channels[1].manual).toBe(true)
    })
  })

  it('<Main /> should change mode from manual to auto', () => {
    const fn = jest.fn()
    const fnUpdateLight = jest.fn()

    light.channels[1].manual = true

    const m = new TestMain({
      fetchLights: fn,
      fetchJacks: fn,
      lights: [light, light],
      updateLight: fnUpdateLight
    })

    expect.assertions(2)
    return (m.handleChangeMode(light)()).then(() => {
      expect(fnUpdateLight).toHaveBeenCalledTimes(1)
      const actualArgs = fnUpdateLight.mock.calls[0][1]
      expect(actualArgs.channels[1].manual).toBe(false)
    })
  })

  it('<Main /> should change mode from mixed to auto', () => {
    const fn = jest.fn()
    const fnUpdateLight = jest.fn()

    light.channels[2] = {
      pin: 0,
      color: '',
      manual: true,
      profile: {
        type: 'interval',
        config: {
          start: '14:00:00',
          end: '22:00:00',
          values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        }
      }
    }

    const m = new TestMain({
      fetchLights: fn,
      fetchJacks: fn,
      lights: [light, light],
      updateLight: fnUpdateLight
    })

    expect.assertions(3)
    return (m.handleChangeMode(light)()).then(() => {

      expect(fnUpdateLight).toHaveBeenCalledTimes(1)
      const actualArgs = fnUpdateLight.mock.calls[0][1]
      expect(actualArgs.channels[1].manual).toBe(false)
      expect(actualArgs.channels[2].manual).toBe(false)
    })
  })

  it('<Main /> should set the interval when start is before end', () => {
    const fn = jest.fn()
    const fnUpdateLight = jest.fn()

    light.channels[1].profile.config.start = '14:00:00'
    light.channels[1].profile.config.end = '16:00:00'
    light.channels[1].profile.config.values = [1,2,3.6,4,5]
    const m = new TestMain({
      fetchLights: fn,
      fetchJacks: fn,
      lights: [light, light],
      updateLight: fnUpdateLight
    })

    const values = {
      config: {
        id: 1,
        name: 'light',
        channels: light.channels,
        jack: light.jack
      }
    }
    m.handleUpdateLight(values)

    expect(fnUpdateLight).toHaveBeenCalledTimes(1)
    const actualArgs = fnUpdateLight.mock.calls[0][1]
    expect(actualArgs.channels[1].profile.config.interval).toBe(30 * 60)
  })


  it('<Main /> should set the interval when end is before start', () => {
    const fn = jest.fn()
    const fnUpdateLight = jest.fn()

    light.channels[1].profile.type = 'auto'
    light.channels[1].profile.config.start = '23:00:00'
    light.channels[1].profile.config.end = '01:00:00'
    light.channels[1].profile.config.values = [1,2,3,4,5]
    const m = new TestMain({
      fetchLights: fn,
      fetchJacks: fn,
      lights: [light, light],
      updateLight: fnUpdateLight
    })

    const values = {
      config: {
        id: 1,
        name: 'light',
        channels: light.channels,
        jack: light.jack
      }
    }
    m.handleUpdateLight(values)

    expect(fnUpdateLight).toHaveBeenCalledTimes(1)
    const actualArgs = fnUpdateLight.mock.calls[0][1]
    expect(actualArgs.channels[1].profile.config.interval).toBe(30 * 60)
  })

  it('<LightForm />', () => {
    const fn = jest.fn()
    light.channels[2] = {
      pin: 0,
      color: '',
      profile: {
        type: 'interval',
        config: {
          start: '14:00:00',
          end: '22:00:00',
          values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        }
      }
    }
    const values = mapLightPropsToValues({ config: light })
    submitLightForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalled()
    expect(LightForm).toBeDefined()
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
      isValid: true
    })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(fn).toHaveBeenCalled()
    expect(showUpdateSuccessful).toHaveBeenCalled()
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
      dirty: true
    })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(fn).toHaveBeenCalled()
    expect(showError).toHaveBeenCalled()
  })

  it('<Chart />', () => {
    const withConfig = new RawChart({ config: light })
    const withoutConfig = new RawChart({})
    expect(withConfig.render().type).toBe(IntervalChart)
    expect(withoutConfig.render().type).toBe('span')
  })

  it('<Channel />', () => {
    const m = Channel({ name: '', channel: light.channels['1'], onChangeHandler: () => {}, touched: {}, errors: {} })
    expect(m.type).toBe('div')
  })

  it('<Profile /> fixed', () => {
    const fn = jest.fn()
    const wrapper = Profile({ name: 'name', type: 'fixed', onChangeHandler: fn, value: {} })
    expect(wrapper.type).toBe(FixedProfile)
  })

  it('<Profile /> interval', () => {
    const wrapper = Profile({ name: 'name', type: 'interval', onChangeHandler: () => true, value: {} })
    expect(wrapper.type).toBe(AutoProfile)
  })

  it('<Profile /> diurnal', () => {
    const wrapper = Profile({ name: 'name', type: 'diurnal', onChangeHandler: () => true, value: {} })
    expect(wrapper.type).toBe(DiurnalProfile)
  })

  it('<DiurnalProfile />', () => {
    expect(DiurnalProfile({ name: 'testDiurnal', onChangeHandler: () => true }).type).toBe('div')
  })

  it('<FixedProfile />', () => {
    const onChangeHandler = jest.fn()
    const m = new FixedProfile({ onChangeHandler, config: { value: '1' } })
    m.setState = update => { m.state = { ...m.state, ...update } }
    m.handleChange(ev)
    m.handleChange({ target: { value: 'foo' } })
    expect(onChangeHandler).toHaveBeenCalledWith({
      start: undefined,
      end: undefined,
      value: 10.5
    })
  })

  it('<FixedProfile /> should not allow empty value', () => {
    const onChangeHandler = jest.fn()
    const m = new FixedProfile({ onChangeHandler, config: { value: '1' } })
    m.setState = update => { m.state = { ...m.state, ...update } }
    m.handleChange(ev)
    m.handleChange({ target: { value: '' } })
    expect(onChangeHandler).toHaveBeenLastCalledWith({
      start: undefined,
      end: undefined,
      value: ''
    })
  })

  it('<SineProfile />', () => {
    const config = { config: { value: '1'} }
    const wrapper = SineProfile({
      name: 'testsine',
      config,
      readOnly: false,
      onChangeHandler: () => {}
    })
    expect(wrapper.type).toBe('div')
  })

  it('<RandomProfile />', () => {
    const config = { config: { value: '1'} }
    const wrapper = RandomProfile({
      name: 'testrandom',
      config,
      readOnly: false,
      onChangeHandler: () => {}
    })
    expect(wrapper.type).toBe('div')
  })

  it('<LunarProfile />', () => {
    const config = { config: { value: '1'} }
    const wrapper = LunarProfile({
      name: 'testLunar',
      config,
      readOnly: false,
      onChangeHandler: () => {}
    })
    expect(wrapper.type).toBe('div')
  })

  it('<Percent />', () => {
    const onChange = jest.fn()
    const wrapper = Percent({ value: '4', onChange, name: 'percent' })
    wrapper.props.onChange({ target: { name: 'percent', value: '34' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('<ProfileSelector />', () => {
    const fn = jest.fn()
    const wrapper = ProfileSelector({ name: 'name', value: 'fixed', onChangeHandler: fn })
    expect(findByType(wrapper, 'input')).toHaveLength(10)
    const select = findByType(wrapper, 'select')[0]
    const event = { target: { value: 'diurnal' } }
    select.props.onChange(event)
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        name: 'name',
        value: 'diurnal'
      })
    }))
  })
})
