import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Provider } from 'react-redux'
import Main from './main'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
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

  it('renders without throwing with journals', () => {
    const store = mockStore({ journals: journals })
    expect(() =>
      shallow(<Provider store={store}><Main /></Provider>)
    ).not.toThrow()
  })

  it('renders without throwing with empty journals', () => {
    const store = mockStore({ journals: [] })
    expect(() =>
      shallow(<Provider store={store}><Main /></Provider>)
    ).not.toThrow()
  })

  it('renders ConnectedMain in Provider', () => {
    const store = mockStore({ journals: journals })
    const wrapper = shallow(<Provider store={store}><Main /></Provider>)
    expect(wrapper.find('Connect(main)')).toHaveLength(1)
  })
})
