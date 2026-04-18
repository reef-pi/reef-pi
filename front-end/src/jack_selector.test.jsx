import JackSelector from './jack_selector'
import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

const jacks = [{ id: '1', name: 'Foo', pins: [1, 2] }]
describe('JackSelector', () => {
  it('renders without throwing with matching jack', () => {
    const store = mockStore({ jacks })
    expect(() =>
      shallow(<Provider store={store}><JackSelector id='1' update={() => {}} /></Provider>)
    ).not.toThrow()
  })

  it('renders without throwing with no matching jack', () => {
    const store = mockStore({ jacks })
    expect(() =>
      shallow(<Provider store={store}><JackSelector id='99' update={() => {}} /></Provider>)
    ).not.toThrow()
  })

  it('renders without throwing with empty jacks list', () => {
    const store = mockStore({ jacks: [] })
    expect(() =>
      shallow(<Provider store={store}><JackSelector id='1' update={() => {}} /></Provider>)
    ).not.toThrow()
  })

  it('renders via dive', () => {
    const store = mockStore({ jacks })
    const wrapper = shallow(<JackSelector id='1' update={() => {}} store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders via dive with no match', () => {
    const store = mockStore({ jacks })
    const wrapper = shallow(<JackSelector id='99' update={() => {}} store={store} />).dive()
    expect(wrapper).toBeDefined()
  })
})
