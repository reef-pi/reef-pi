import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Formik, Form } from 'formik'
import Channel from './channel'
import { RawLightingChart } from './chart'
import { TestMain } from './main'
import LightForm from './light_form'
import Light from './light'
import LightSummary from './light_summary'
import ManualLight from './manual_light'
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
import { DEFAULT_CHANNEL_COLOR } from './main'
import Percent from '../ui_components/percent'
import * as Alert from 'utils/alert'
import 'isomorphic-fetch'

const wrapFormik = (component, initialValues = {}) => renderToStaticMarkup(
  <Formik initialValues={initialValues} onSubmit={() => {}}>
    <Form>{component}</Form>
  </Formik>
)

const findNode = (node, predicate) => {
  if (!node || typeof node !== 'object') {
    return undefined
  }
  if (predicate(node)) {
    return node
  }
  for (const child of React.Children.toArray(node.props?.children)) {
    const found = findNode(child, predicate)
    if (found) {
      return found
    }
  }
  return undefined
}

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
    document.body.innerHTML = ''
  })

  it('<Main />', () => {
    const lights = [
      { ...light, id: '1', name: 'light B' },
      { ...light, id: '2', name: 'light A' }
    ]
    const m = createMain({ lights })
    const items = m.lightsList()
    expect(items).toHaveLength(2)
    expect(items[0].props.name).toBe('light-2')
    expect(lights.map(item => item.name)).toEqual(['light B', 'light A'])
  })

  it('<Main /> shows a read-only summary with separate edit actions (#3309)', () => {
    const m = createMain({ lights: [{ ...light, name: 'Reef bar', enable: 'false' }] })
    const [item] = m.lightsList()
    const children = React.Children.toArray(item.props.children)
    const title = renderToStaticMarkup(item.props.title)

    expect(title).toContain('Reef bar')
    expect(title).toContain('Disabled')
    expect(item.props.separateEdit).toBe(true)
    expect(item.props.overflowActions).toBe(true)
    expect(item.props.actionsLabel).toBe('Actions for Reef bar')
    expect(renderToStaticMarkup(item.props.buttons)).toContain('Auto')
    expect(children[0].type).toBe(LightSummary)
    expect(children[0].props).toEqual(expect.objectContaining({
      light: expect.objectContaining({ name: 'Reef bar' }),
      jacks: m.props.jacks,
      mode: 'auto'
    }))
    expect(children[children.length - 1].type).toBe(LightForm)
  })

  it('<Main /> normalizes enabled strings in the row title', () => {
    const m = createMain({ lights: [{ ...light, enable: 'true' }] })
    const [item] = m.lightsList()

    expect(renderToStaticMarkup(item.props.title)).toContain('Enabled')
  })

  it('<Main /> keeps Manual controls below the summary and the editor last', () => {
    light.channels[1].manual = true
    const m = createMain({ lights: [light] })
    const [item] = m.lightsList()
    const children = React.Children.toArray(item.props.children)
    const summaryChildren = React.Children.toArray(children[0].props.children)

    expect(children[0].type).toBe(LightSummary)
    expect(children[0].props.mode).toBe('manual')
    expect(summaryChildren).toHaveLength(1)
    expect(summaryChildren[0].type).toBe(ManualLight)
    expect(children[children.length - 1].type).toBe(LightForm)
  })

  it('<Main /> handles lights without channel data', () => {
    const m = createMain({ lights: [{ ...light, channels: undefined }] })

    expect(() => m.lightsList()).not.toThrow()
    expect(m.getLightMode({ ...light, channels: undefined })).toBe('auto')
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
    const html = renderToStaticMarkup(
      <LightForm onSubmit={jest.fn()} config={light} jacks={[{ id: '1', name: 'foo' }]} />
    )
    expect(html).toContain('form-light-1')
    expect(html).toContain('reefpi-lighting-form')
    expect(html).toContain('reefpi-lighting-fixture')
    expect(html).toContain('reefpi-controller-form__actions')
  })

  it('<LightForm /> maps legacy auto profiles to interval profiles', () => {
    const config = {
      ...light,
      channels: {
        1: {
          ...light.channels[1],
          profile: {
            ...light.channels[1].profile,
            type: 'auto'
          }
        }
      }
    }

    renderToStaticMarkup(
      <LightForm onSubmit={jest.fn()} config={config} jacks={[{ id: '1', name: 'foo' }]} />
    )

    expect(config.channels[1].profile.type).toBe('interval')
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

  it('<Light /> cancels editing without submitting', () => {
    const submitForm = jest.fn()
    const onCancel = jest.fn()
    const form = Light({
      values: { config: light },
      config: light,
      submitForm,
      onCancel,
      isValid: true,
      dirty: true,
      jacks: [{ id: '1', name: 'foo' }],
      touched: {},
      errors: {},
      handleBlur: jest.fn(),
      handleChange: jest.fn()
    })
    const cancel = findNode(form, node => node.props?.['data-testid'] === 'lighting-cancel')

    expect(cancel).toBeTruthy()
    expect(cancel.props.type).toBe('button')
    expect(cancel.props.variant).toBe('secondary')
    cancel.props.onClick()
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(submitForm).not.toHaveBeenCalled()
  })

  it('<Chart />', () => {
    expect(new RawLightingChart({ config: undefined, light_id: '1' }).render().type).toBe('span')
    expect(new RawLightingChart({ config: light, light_id: '1', width: 100, height: 100 }).render().type).toBeDefined()
  })

  it('<Channel />', () => {
    const html = wrapFormik(
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
    )

    expect(html).toContain('channel_name')
    expect(html).toContain('<section')
    expect(html).toContain('reefpi-lighting-channel')
    expect(html).toContain('Pin 0')
    expect(html).toContain('Minimum (%)')
    expect(html).toContain('Maximum (%)')
    expect(html).toContain('data-testid="lighting-profile-selector"')
  })

  it('<Channel /> resets profile config when profile type changes', () => {
    const profileTypes = {
      fixed: { start: '', end: '', value: 0 },
      diurnal: { start: '', end: '' },
      interval: {
        start: '00:00:00',
        end: '22:00:00',
        interval: 120,
        values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      lunar: { start: '', end: '', full_moon: null },
      random: { start: '', end: '' },
      sine: { start: '', end: '' },
      circadian: { start: '', end: '', dawn_value: 10, noon_value: 100 },
      cyclic: { period: 60, phase_shift: 0 },
      lightning: { start: '', end: '', frequency: 2, flash_slot: 1, intensity: 100 },
      solar: { latitude: 0, longitude: 0 },
      unknown: {}
    }

    Object.entries(profileTypes).forEach(([type, config]) => {
      const onChangeHandler = jest.fn()
      const setTouched = jest.fn()
      const touched = {
        config: {
          channels: {
            1: {
              profile: {
                config: { start: true }
              }
            }
          }
        }
      }
      const tree = Channel({
        name: 'config.channels.1',
        channel: light.channels['1'],
        channelNum: '1',
        onChangeHandler,
        onBlur: jest.fn(),
        touched,
        errors: {},
        setTouched
      })
      const selector = findNode(tree, node => node.type === ProfileSelector)
      selector.props.onChangeHandler({ target: { name: 'profile', value: type } })

      expect(onChangeHandler).toHaveBeenCalledWith({
        target: {
          name: 'profile',
          value: {
            type,
            config
          }
        }
      }, '1')
      if (type !== 'unknown') {
        expect(setTouched).toHaveBeenCalledWith(touched)
      }
    })
  })

  it('<Main /> defines a default color for new light channels', () => {
    expect(DEFAULT_CHANNEL_COLOR).toBe('#000000')
  })

  it('<Main /> should require a jack when adding a light', () => {
    const fnCreateLight = jest.fn()
    const m = createMain({ createLight: fnCreateLight })

    m.handleAddLight()

    expect(Alert.showError).toHaveBeenCalled()
    expect(fnCreateLight).not.toHaveBeenCalled()
  })

  it('<Main /> should require a light name when adding a light', () => {
    const fnCreateLight = jest.fn()
    const m = createMain({ createLight: fnCreateLight })
    // lightName defaults to '' in state — no need for DOM manipulation
    m.state.selectedJack = 0

    m.handleAddLight()

    expect(Alert.showError).toHaveBeenCalled()
    expect(fnCreateLight).not.toHaveBeenCalled()
  })

  it('<Main /> should create a light with default channels and reset the add form', () => {
    const fnCreateLight = jest.fn()
    const m = createMain({ createLight: fnCreateLight })
    m.state = {
      ...m.state,
      addLight: true,
      selectedJack: 0,
      lightName: 'Frag Rack'
    }
    m.setState = update => { m.state = { ...m.state, ...update } }

    m.handleAddLight()

    expect(fnCreateLight).toHaveBeenCalledWith({
      name: 'Frag Rack',
      jack: '1',
      enable: true,
      channels: {
        1: {
          color: DEFAULT_CHANNEL_COLOR,
          manual: false,
          min: 0,
          max: 100,
          name: 'Channel-1',
          on: true,
          pin: 1,
          value: 0,
          profile: {
            type: 'fixed',
            config: {
              start: '00:00:00',
              end: '23:59:59',
              value: 0
            }
          }
        },
        2: {
          color: DEFAULT_CHANNEL_COLOR,
          manual: false,
          min: 0,
          max: 100,
          name: 'Channel-2',
          on: true,
          pin: 2,
          value: 0,
          profile: {
            type: 'fixed',
            config: {
              start: '00:00:00',
              end: '23:59:59',
              value: 0
            }
          }
        }
      }
    })
    expect(m.state.addLight).toBe(false)
    // lightName is now cleared via React state, not DOM mutation
    expect(m.state.lightName).toBe('')
  })

  it('<Main /> should render jacks and set selected jack', () => {
    const m = createMain({
      jacks: [
        { id: '1', name: 'alpha', pins: [1] },
        { id: '2', name: 'beta', pins: [2] }
      ]
    })
    m.setState = update => { m.state = { ...m.state, ...update } }

    const jacks = m.jacksList()
    jacks[1].props.onClick()

    expect(jacks).toHaveLength(2)
    expect(jacks[0].props.children.props.id).toBe('select-jack-alpha')
    expect(m.state.selectedJack).toBe(1)
    expect(renderToStaticMarkup(m.newLightUI())).toContain('beta')
  })

  it('<Main /> should normalize lunar full moon date when updating a light', () => {
    const fnUpdateLight = jest.fn()
    light.channels[1].profile = {
      type: 'lunar',
      config: {
        start: '00:00:00',
        end: '23:59:59',
        full_moon: new Date(2024, 1, 24)
      }
    }
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
    expect(fnUpdateLight.mock.calls[0][1].channels[1].profile.config.full_moon).toBe('2024-02-24')
  })

  it('<Main /> should confirm before deleting a light', () => {
    const fnDeleteLight = jest.fn()
    const m = createMain({ deleteLight: fnDeleteLight })

    expect.assertions(2)
    m.handleDeleteLight(light)
    expect(fnDeleteLight).not.toHaveBeenCalled()
    return Promise.resolve().then(() => {
      expect(fnDeleteLight).toHaveBeenCalledWith('1')
    })
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

  it('<FixedProfile /> renders a compact, bounded intensity editor', () => {
    const html = wrapFormik(
      <FixedProfile
        name='profile'
        config={{ start: '08:00:00', end: '20:00:00', value: 45 }}
        onChangeHandler={jest.fn()}
        touched={{}}
        errors={{}}
      />,
      { profile: { start: '08:00:00', end: '20:00:00', value: 45 } }
    )

    expect(html).toContain('reefpi-lighting-fixed')
    expect(html).toContain('Intensity (%)')
    expect(html).toContain('min="0"')
    expect(html).toContain('max="100"')
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
    const select = findNode(selector, node => node.type === 'select' && node.props['data-testid'] === 'lighting-profile-selector')
    expect(select.props['aria-label']).toBe('Profile')
    expect(React.Children.count(select.props.children)).toBe(10)
    expect(React.Children.toArray(select.props.children).map(option => option.props.value)).toEqual([
      'fixed',
      'interval',
      'diurnal',
      'random',
      'sine',
      'lunar',
      'circadian',
      'cyclic',
      'lightning',
      'solar'
    ])
    expect(React.Children.toArray(select.props.children).map(option => option.props.children)).toEqual([
      'Fixed',
      'Interval',
      'Diurnal',
      'Random',
      'Sine',
      'Lunar',
      'Circadian',
      'Cyclic',
      'Lightning',
      'Solar'
    ])
    select.props.onChange({ target: { value: 'diurnal' } })
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
