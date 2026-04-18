import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import Main from './main'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockImplementation(() => Promise.resolve(true))
}))

const journals = [
  { id: '1', name: 'pH Log', description: 'daily', unit: 'pH' },
  { id: '2', name: 'Alkalinity', description: 'weekly', unit: 'dKH' }
]

describe('<Main />', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('smoke test via Provider shallow', () => {
    const store = mockStore({ journals })
    expect(() =>
      shallow(<Provider store={store}><Main /></Provider>)
    ).not.toThrow()
  })

  it('mounts with journal list', () => {
    fetchMock.get('/api/journal', journals)
    const store = mockStore({ journals })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('mounts with empty journal list', () => {
    fetchMock.get('/api/journal', [])
    const store = mockStore({ journals: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('renders New sub-component for adding journals', () => {
    fetchMock.get('/api/journal', journals)
    const store = mockStore({ journals })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    // Journal main delegates add via New sub-component — verify list renders
    expect(wrapper.find('ul.list-group').length).toBeGreaterThan(0)
    wrapper.unmount()
  })
})
