import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Summary from './summary'
import configureMockStore from 'redux-mock-store'
import renderer from 'react-test-renderer'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Summary', () => {
  it('<Summary />', () => {
    const m = shallow(
      <Summary
        info={{}}
        fetch={() => true}
        errors={[]}
        timer={window.setInterval(() => true, 1800 * 1000)}
      />
    ).instance()
    m.componentWillUnmount()
  })
})
