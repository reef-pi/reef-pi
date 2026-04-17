import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import SelectEquipment from './select_equipment'
import fetchMock from 'fetch-mock'

const mockStore = configureMockStore([thunk])

const equipment = [
  { id: '1', name: 'Heater' },
  { id: '2', name: 'Skimmer' }
]

describe('SelectEquipment', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('renders without throwing with active equipment', () => {
    const store = mockStore({ equipment })
    expect(() =>
      shallow(<Provider store={store}><SelectEquipment id='eq-sel' active='1' update={() => {}} /></Provider>)
    ).not.toThrow()
  })

  it('renders without throwing with empty equipment', () => {
    const store = mockStore({ equipment: [] })
    expect(() =>
      shallow(<Provider store={store}><SelectEquipment id='eq-sel' active='' update={() => {}} /></Provider>)
    ).not.toThrow()
  })

  it('renders without throwing in readOnly mode', () => {
    const store = mockStore({ equipment })
    expect(() =>
      shallow(<Provider store={store}><SelectEquipment id='eq-sel' active='1' update={() => {}} readOnly /></Provider>)
    ).not.toThrow()
  })

  it('renders via dive with active equipment', () => {
    const store = mockStore({ equipment })
    const wrapper = shallow(<SelectEquipment id='eq-sel' active='1' update={() => {}} store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders via dive with no active equipment', () => {
    const store = mockStore({ equipment })
    const wrapper = shallow(<SelectEquipment id='eq-sel' active='' update={() => {}} store={store} />).dive()
    expect(wrapper).toBeDefined()
  })
})
