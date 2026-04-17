import React from 'react'
import { shallow } from 'enzyme'
import AtoForm from './ato_form'
import 'isomorphic-fetch'

const fn = jest.fn()

describe('AtoForm', () => {
  it('renders and submits for create (no data prop)', () => {
    const wrapper = shallow(<AtoForm onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('renders and submits for edit with equipment control', () => {
    const data = {
      id: '1', name: 'Main ATO', enable: true, control: true, is_macro: false,
      inlet: '1', pump: '2', period: 60, debounce: 5, one_shot: false,
      disable_on_alert: false, notify: { enable: true, max: 120 }
    }
    const wrapper = shallow(<AtoForm data={data} onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('renders for edit with macro control', () => {
    const data = {
      id: '2', name: 'Macro ATO', enable: true, control: true, is_macro: true,
      inlet: '', pump: '', period: 60, debounce: 0, one_shot: false,
      disable_on_alert: false, notify: {}
    }
    const wrapper = shallow(<AtoForm data={data} onSubmit={fn} />)
    expect(wrapper).toBeDefined()
  })

  it('renders with control disabled', () => {
    const data = {
      id: '3', name: 'Sensor Only', enable: false, control: false,
      inlet: '', pump: '', period: 60, debounce: 0, one_shot: false,
      disable_on_alert: false, notify: {}
    }
    const wrapper = shallow(<AtoForm data={data} onSubmit={fn} />)
    expect(wrapper).toBeDefined()
  })
})
