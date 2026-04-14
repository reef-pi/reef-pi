import JackSelector from './jack_selector'
import React from 'react'
import { shallow } from 'enzyme'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
const mockStore = configureMockStore([thunk])


describe('JackSelector', () => {
  it('<JackSelector />', () => {
    const jacks = [{ id: '1', name: 'Foo', pins: [1, 2] }]
    shallow(
      <Provider store={mockStore({ jacks })}>
        <JackSelector id='1' update={() => {}} />
      </Provider>)
  })
})
