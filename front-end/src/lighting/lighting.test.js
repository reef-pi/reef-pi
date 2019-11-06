import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Channel from './channel'
import Chart from './chart'
import Main from './main'
import LightForm from './light_form'
import Light from './light'
import AutoProfile from './auto_profile'
import DiurnalProfile from './diurnal_profile'
import FixedProfile from './fixed_profile'
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
    target: { value: 10 }
  }
  const light = {
    id: '1',
    name: 'foo',
    jack: '1',
    channels: {
      1: {
        pin: 0,
        color: '',
        profile: {
          type: 'auto',
          config: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
        }
      }
    }
  }
  it('<Main />', () => {
    const jacks = [{ id: '1', name: 'foo' }]
    const m = shallow(<Main store={mockStore({ lights: [light], jacks: jacks })} />)
      .dive()
      .instance()
    m.setJack(0, {})
    m.handleToggleAddLightDiv()
    m.handleAddLight()
  })

  it('<LightForm />', () => {
    const fn = jest.fn()
    const wrapper = shallow(<LightForm onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<Light />', () => {
    const values = { config: light }
    shallow(
      <Light values={values} config={light} save={() => {}} remove={() => true} submitForm={() => true} />
    )
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore({ lights: [light] })} light_id='1' />).dive()
    const m = shallow(<Chart store={mockStore({ lights: [] })} light_id='1' />)
      .dive()
      .instance()
    m.channel2line({ profile: { type: 'foo' } }, {})
    m.channel2line(
      { name: 'bar', color: '#CCC', pin: '1', profile: { type: 'auto', config: { values: [{ foo: 'bar' }] } } },
      { 0: { time: 'h' } }
    )
  })

  it('<Channel />', () => {
    shallow(<Channel channel={light.channels['1']} onChangeHandler={() => {}} />)
  })

  it('<Profile /> fixed', () => {
    const wrapper = shallow(<Profile type='fixed' onChangeHandler={() => true} />)
    expect(wrapper.find(FixedProfile).length).toBe(1)
    expect(wrapper.find(AutoProfile).length).toBe(0)
    expect(wrapper.find(DiurnalProfile).length).toBe(0)
  })

  it('<Profile /> auto', () => {
    const wrapper = shallow(<Profile type='auto' onChangeHandler={() => true} />)
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

  it('<AutoProfile />', () => {
    const config = {
      values: []
    }
    let m = shallow(<AutoProfile store={mockStore()} config={config} onChangeHandler={() => true} />).instance()
    m.curry(1)(ev)
    m = shallow(<AutoProfile store={mockStore()} onChangeHandler={() => true} />).instance()
    m.curry(1)({ target: { value: 'foo' } })
  })

  it('<DiurnalProfile />', () => {
    shallow(<DiurnalProfile onChangeHandler={() => true} />).instance()
  })

  it('<FixedProfile />', () => {
    const m = shallow(<FixedProfile onChangeHandler={() => true} config={{ config: { value: '1' } }} />).instance()
    m.handleChange(ev)
    m.handleChange({ target: { value: 'foo' } })
  })

  it('<Percent />', () => {
    const wrapper = shallow(<Percent value='4' onChange={() => true} />)
    wrapper.find('input').simulate('change', { target: { value: 34 } })
  })
})
