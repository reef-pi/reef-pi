import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Provider } from 'react-redux'
import New from './new'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('<New />', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('renders without throwing', () => {
    const store = mockStore({ journals: [] })
    expect(() =>
      shallow(<Provider store={store}><New /></Provider>)
    ).not.toThrow()
  })

  it('renders ConnectedNew inside Provider', () => {
    const store = mockStore({ journals: [] })
    const wrapper = shallow(<Provider store={store}><New /></Provider>)
    expect(wrapper.find('Connect(newJournal)')).toHaveLength(1)
  })

  it('renders add button using store prop pattern', () => {
    const store = mockStore({ journals: [] })
    const wrapper = shallow(<New store={store} />).dive()
    expect(wrapper.find('#add_new_journal')).toHaveLength(1)
  })

  it('shows + initially', () => {
    const store = mockStore({ journals: [] })
    const wrapper = shallow(<New store={store} />).dive()
    expect(wrapper.find('#add_new_journal').prop('value')).toBe('+')
  })

  it('toggles to - on click', () => {
    const store = mockStore({ journals: [] })
    const wrapper = shallow(<New store={store} />).dive()
    wrapper.find('#add_new_journal').simulate('click')
    expect(wrapper.find('#add_new_journal').prop('value')).toBe('-')
  })

  it('toggles state.add on button click', () => {
    const store = mockStore({ journals: [] })
    const wrapper = shallow(<New store={store} />).dive()
    expect(wrapper.instance().state.add).toBe(false)
    wrapper.find('#add_new_journal').simulate('click')
    expect(wrapper.instance().state.add).toBe(true)
    wrapper.find('#add_new_journal').simulate('click')
    expect(wrapper.instance().state.add).toBe(false)
  })

  it('handleSubmit collapses the form', () => {
    fetchMock.putOnce('/api/journal', {})
    fetchMock.getOnce('/api/journal', [])
    const store = mockStore({ journals: [] })
    const wrapper = shallow(<New store={store} />).dive()
    wrapper.find('#add_new_journal').simulate('click')
    expect(wrapper.instance().state.add).toBe(true)
    wrapper.instance().handleSubmit({ name: 'test', description: 'desc', unit: 'pH' })
    expect(wrapper.instance().state.add).toBe(false)
  })
})
