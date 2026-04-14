import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { ConnectedChart, RawChart } from './chart'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

const journal = { id: '1', name: 'pH', unit: 'pH' }
const readings = {
  historical: [
    { timestamp: 'Jan-01-10:00, 2023', value: 7.2 },
    { timestamp: 'Jan-01-11:00, 2023', value: 7.4 }
  ]
}

describe('<Chart />', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('renders without throwing when journal not in store', () => {
    fetchMock.getOnce('/api/journal/1/usage', readings)
    const store = mockStore({ journals: [], journal_usage: {} })
    expect(() =>
      mount(<Provider store={store}><ConnectedChart journal_id='1' width={500} height={300} /></Provider>)
    ).not.toThrow()
  })

  it('renders without throwing when readings available', () => {
    fetchMock.getOnce('/api/journal/1/usage', readings)
    const store = mockStore({
      journals: [journal],
      journal_usage: { '1': readings }
    })
    expect(() =>
      mount(<Provider store={store}><ConnectedChart journal_id='1' width={500} height={300} /></Provider>)
    ).not.toThrow()
  })

  it('renders RawChart inside Provider', () => {
    fetchMock.getOnce('/api/journal/1/usage', readings)
    const store = mockStore({ journals: [journal], journal_usage: {} })
    const wrapper = mount(
      <Provider store={store}><RawChart journal_id='1' width={500} height={300} /></Provider>
    )
    expect(wrapper.find('RawChart')).toHaveLength(1)
  })
})
