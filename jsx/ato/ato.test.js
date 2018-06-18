import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ATO from './ato'
import New from './new'
import Main from './main'
import Chart from './chart'
import configureMockStore from 'redux-mock-store'
import {mockLocalStorage} from '../utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import renderer from 'react-test-renderer'
import {Provider} from 'react-redux'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('ATO ui', () => {
  it('<ATO />', () => {
    renderer.create(
      <Provider store={mockStore({ato_usage: {}})} >
        <ATO data={{}} />
      </Provider>
    )
  })

  it('<New />', () => {
    shallow(<New store={mockStore()} />)
  })

  it('<Main />', () => {
    shallow(<Main store={mockStore()} />)
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore({ato_usage: {}})} />)
  })
})
