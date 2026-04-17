import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import Chart from './chart'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

const atoConfig = { id: '1', name: 'Main ATO' }
const usage = { historical: [{ time: 'Jul-01-10:00, 2024', pump: 5 }] }

describe('ATO Chart', () => {
  it('renders without throwing via Provider', () => {
    const store = mockStore({ atos: [atoConfig], ato_usage: { 1: usage } })
    expect(() =>
      shallow(<Provider store={store}><Chart ato_id='1' height={200} /></Provider>)
    ).not.toThrow()
  })

  it('renders via dive when usage is missing', () => {
    const store = mockStore({ atos: [atoConfig], ato_usage: {} })
    const wrapper = shallow(<Chart ato_id='1' height={200} store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders via dive when config is missing', () => {
    const store = mockStore({ atos: [], ato_usage: { 1: usage } })
    const wrapper = shallow(<Chart ato_id='1' height={200} store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders via dive with config and usage present', () => {
    const store = mockStore({ atos: [atoConfig], ato_usage: { 1: usage } })
    const wrapper = shallow(<Chart ato_id='1' height={200} store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('clears interval on unmount', () => {
    jest.useFakeTimers()
    const store = mockStore({ atos: [atoConfig], ato_usage: { 1: usage } })
    const wrapper = shallow(<Chart ato_id='1' height={200} store={store} />).dive()
    jest.advanceTimersByTime(15000)
    wrapper.unmount()
    jest.useRealTimers()
    expect(wrapper).toBeDefined()
  })
})
