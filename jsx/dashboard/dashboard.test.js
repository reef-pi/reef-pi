import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Main from './main'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'
import {mockLocalStorage} from '../utils/test_helper'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Dashboard', () => {
  it('<Main />', () => {
    const config = {
      row: 2,
      column: 2,
      width: 400,
      height: 200,
      grid_details: [
        [{type: 'equipment'}, {type: 'ato', id: '1'}],
        [{type: 'light', id: '1'}, {type: 'health', id: 'current'}]
      ]
    }
    shallow(<Main store={mockStore({dashboard: config})} />).dive()
  })
})
