import JackSelector from './jack_selector'
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
const mockStore = configureMockStore([thunk])
Enzyme.configure({ adapter: new Adapter() })

describe('JackSelector', () => {
  it('<JackSelector />', () => {
    let mock = {
      jacks: [
        {
          id: 1,
          name: 'foo'
        }
      ]
    }
    const m = shallow(<JackSelector store={mockStore(mock)} />).instance()
    m.render()
  })
})
