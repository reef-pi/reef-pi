import React from 'react'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Summary from './summary'
import configureMockStore from 'redux-mock-store'
import renderer from 'react-test-renderer'
import {mockLocalStorage} from './utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Summary', () => {
  it('<Summary />', () => {
    renderer.create(
      <Summary
        info={{}}
        fetch={()=> true}
        errors={[]}
      />
    )
  })
})
