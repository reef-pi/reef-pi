import JackSelector from './jack_selector'
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
const mockStore = configureMockStore([thunk])

Enzyme.configure({ adapter: new Adapter() })

describe('JackSelector', () => {
  it('<JackSelector />', () => {
    const jacks = [{ id: '1', name: 'Foo', pins: [1, 2] }]
    const m = shallow(
      <Provider store={mockStore({ jacks: jacks })} >
        <JackSelector id='1' update={() => {}} />
      </Provider>)  
  })
})
