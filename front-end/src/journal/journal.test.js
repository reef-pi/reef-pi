import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import Journal from './journal'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

const config = { id: '1', name: 'pH Log', description: 'daily', unit: 'pH' }

const makeStore = () => mockStore({ journals: [config], journal_usage: {} })

const render = (extraProps = {}) => {
  const store = makeStore()
  fetchMock.getOnce('/api/journal/1/usage', {})
  fetchMock.getOnce('/api/journal/1', config)
  return mount(
    <Provider store={store}>
      <Journal config={config} readOnly={false} expanded={false} {...extraProps} />
    </Provider>
  )
}

describe('<Journal />', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('renders without throwing', () => {
    expect(() => render()).not.toThrow()
  })

  it('renders Add Entry button', () => {
    const wrapper = render()
    const btn = wrapper.find('input#add_entry')
    expect(btn).toHaveLength(1)
  })

  it('renders entry form after clicking Add Entry', () => {
    const store = makeStore()
    fetchMock.getOnce('/api/journal/1/usage', {})
    const wrapper = mount(
      <Provider store={store}>
        <Journal config={config} readOnly={false} expanded={false} />
      </Provider>
    )
    wrapper.find('input#add_entry').simulate('click')
    // After toggle, entry form should appear
    expect(wrapper.find('input#add_entry').prop('value')).toBe('-')
  })

  it('shallow renders without throwing', () => {
    const store = makeStore()
    expect(() =>
      shallow(<Provider store={store}><Journal config={config} readOnly={false} expanded={false} /></Provider>)
    ).not.toThrow()
  })
})
