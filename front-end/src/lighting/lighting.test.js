import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Channel from './channel'
import Chart from './chart'
import Main, {TestMain} from './main'
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
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
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
    const m = shallow(<Main store={mockStore({ lights: [light, light], jacks: jacks })} />)
      .dive()
      .instance()
  })

  it('<Main /> should change mode from auto to manual', () => {
    const fn = jest.fn()
    const fnUpdateLight = jest.fn()

    const m = shallow(<TestMain
      fetchLights = {fn}
      fetchJacks = {fn}
      lights = {[light, light]}
      updateLight = {fnUpdateLight}
    />).instance()

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

    const m = shallow(<TestMain
      fetchLights = {fn}
      fetchJacks = {fn}
      lights = {[light, light]}
      updateLight = {fnUpdateLight}
    />).instance()

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

    const m = shallow(<TestMain
      fetchLights = {fn}
      fetchJacks = {fn}
      lights = {[light, light]}
      updateLight = {fnUpdateLight}
    />).instance()

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
    const m = shallow(<TestMain
      fetchLights = {fn}
      fetchJacks = {fn}
      lights = {[light, light]}
      updateLight = {fnUpdateLight}
    />).instance()

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
    const m = shallow(<TestMain
      fetchLights = {fn}
      fetchJacks = {fn}
      lights = {[light, light]}
      updateLight = {fnUpdateLight}
    />).instance()

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
    const wrapper = shallow(<LightForm onSubmit={fn} config={light} />)
    wrapper.simulate('submit', { preventDefault: () => {} })
    expect(fn).toHaveBeenCalled()
  })

  it('<Light /> should submit', () => {
    const fn = jest.fn()
    const values = { config: light }
    const m = shallow(
      <Light values={values} config={light} save={() => {}} remove={() => true} submitForm={fn} isValid={true} />
    )
    m.find('form').simulate('submit', { preventDefault: () => {} })
    expect(fn).toHaveBeenCalled()
  })

  it('<Light /> should show error on submit if not valid', () => {
    const fn = jest.fn()
    const values = { config: light }
    const m = shallow(
      <Light values={values} config={light} save={() => {}} remove={() => true} submitForm={fn} isValid={false} />
    )
    m.find('form').simulate('submit', { preventDefault: () => {} })
    expect(fn).toHaveBeenCalled()
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore({ lights: [light] })} light_id='1' />).dive()
    shallow(<Chart store={mockStore({ lights: [] })} light_id='1' />)
      .dive()
      .instance()
  })

  it('<Channel />', () => {
    const m = shallow(<Channel name='' channel={light.channels['1']} onChangeHandler={() => {}} />)
    expect(m).toBeDefined()
  })

  it('<Profile /> fixed', () => {
    const fn = jest.fn()
    const wrapper = shallow(<Profile type='fixed' onChangeHandler={fn} />)
    expect(wrapper.find(FixedProfile).length).toBe(1)
    expect(wrapper.find(AutoProfile).length).toBe(0)
    expect(wrapper.find(DiurnalProfile).length).toBe(0)
  })

  it('<Profile /> interval', () => {
    const wrapper = shallow(<Profile type='interval' onChangeHandler={() => true} />)
    expect(wrapper.find(FixedProfile).length).toBe(0)
    expect(wrapper.find(AutoProfile).length).toBe(1)
    expect(wrapper.find(DiurnalProfile).length).toBe(0)
  })

  it('<Profile /> diurnal', () => {
    const wrapper = shallow(<Profile type='diurnal' onChangeHandler={() => true} />)
    expect(wrapper.find(FixedProfile).length).toBe(0)
    expect(wrapper.find(AutoProfile).length).toBe(0)
    expect(wrapper.find(DiurnalProfile).length).toBe(1)
  })

  it('<DiurnalProfile />', () => {
    shallow(<DiurnalProfile name='testDiurnal' onChangeHandler={() => true} />).instance()
  })

  it('<FixedProfile />', () => {
    const m = shallow(<FixedProfile onChangeHandler={() => true} config={{ config: { value: '1' } }} />).instance()
    m.handleChange(ev)
    m.handleChange({ target: { value: 'foo' } })
  })

  it('<FixedProfile /> should not allow empty value', () => {
    const m = shallow(<FixedProfile onChangeHandler={() => true} config={{ config: { value: '1' } }} />).instance()
    m.handleChange(ev)
    m.handleChange({ target: { value: '' } })
  })

  it('<SineProfile />', () => {
    const config = { config: { value: '1'} }
    const wrapper = shallow(
      <SineProfile
        name='testsine'
        config={config}
        readOnly={false}
        onChangeHandler={() => {}}
      />)
    expect(wrapper).toBeDefined()
  })

  it('<RandomProfile />', () => {
    const config = { config: { value: '1'} }
    const wrapper = shallow(
      <RandomProfile
        name='testrandom'
        config={config}
        readOnly={false}
        onChangeHandler={() => {}}
      />)
    expect(wrapper).toBeDefined()
  })

  it('<LunarProfile />', () => {
    const config = { config: { value: '1'} }
    const wrapper = shallow(
      <LunarProfile
        name='testLunar'
        config={config}
        readOnly={false}
        onChangeHandler={() => {}}
      />)
    expect(wrapper).toBeDefined()
  })

  it('<Percent />', () => {
    const wrapper = shallow(<Percent value='4' onChange={() => true} />)
    wrapper.find('input').simulate('change', { target: { value: 34 } })
  })

  it('<ProfileSelector />', () => {
    const fn = jest.fn()
    const wrapper = shallow(<ProfileSelector name='name' value='fixed' onChangeHandler={fn} />)
    expect(wrapper.find('input').length).toBe(6)
    wrapper.find('select').simulate('change', { target: { value: 'diurnal' } })
  })

})
