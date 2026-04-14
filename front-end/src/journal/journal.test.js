import React from 'react'
import { Provider } from 'react-redux'
import Journal from './journal'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

const config = { id: '1', name: 'pH Log', description: 'daily', unit: 'pH' }

const makeStore = () => mockStore({ journals: [config], journal_usage: {} })

describe('<Journal />', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('renders without throwing', () => {
    const store = makeStore()
    fetchMock.getOnce('/api/journal/1/usage', {})
    fetchMock.getOnce('/api/journal/1', config)
    expect(() => {
      render(<Provider store={store}><Journal config={config} readOnly={false} expanded={false} /></Provider>)
    }).not.toThrow()
  })

  it('renders Add Entry button', () => {
    const store = makeStore()
    fetchMock.getOnce('/api/journal/1/usage', {})
    const wrapper = render(<Provider store={store}><Journal config={config} readOnly={false} expanded={false} /></Provider>)
    const btn = wrapper.find('input#add_entry')
    expect(btn).toHaveLength(1)
  })

  it('renders entry form after clicking Add Entry', () => {
    const store = makeStore()
    fetchMock.getOnce('/api/journal/1/usage', {})
    const wrapper = render(<Provider store={store}><Journal config={config} readOnly={false} expanded={false} /></Provider>)
    const btn = wrapper.find('input#add_entry')
    btn.simulate('click')
    expect(wrapper.find('input#add_entry').prop('value')).toBe('-')
  })

  it('shallow renders without throwing', () => {
    const store = makeStore()
    expect(() => {
      shallow(<Provider store={store}><Journal config={config} readOnly={false} expanded={false} /></Provider>)
    }).not.toThrow()
  })
})
