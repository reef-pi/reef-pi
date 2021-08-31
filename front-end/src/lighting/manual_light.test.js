import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ManualLight from './manual_light'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })

describe('Lighting ui - Manual Control', () => {
  const light = {
    channels: {
      0: { value: 10 },
      1: { value: 20 }
    }
  }

  it('<ManualLight /> should show a slider for each channel', () => {
    const fn = jest.fn()

    const m = shallow(<ManualLight
      light={light}
      handleChange={fn}
                      />)

    expect(m.find('input[type="range"]').length).toBe(2)
  })

  it('<ManualLight /> should not raise a change for alpha values', () => {
    const fn = jest.fn()
    const e = {
      target: {
        name: '0',
        value: 'abc'
      }
    }

    const wrapper = shallow(<ManualLight
      light={light}
      handleChange={fn}
                            />)

    const instance = wrapper.instance()

    instance.handleValueChange(e)
    expect(instance.state.channels[0].value).toBe(10)
  })

  it('<ManualLight /> should raise a change for numeric values', () => {
    const fn = jest.fn()
    const e = {
      target: {
        name: '0',
        value: '44.5'
      }
    }

    const wrapper = shallow(<ManualLight
      light={light}
      handleChange={fn}
                            />)

    const instance = wrapper.instance()

    instance.handleValueChange(e)
    expect(instance.state.channels[0].value).toBe('44.5')
  })
})
