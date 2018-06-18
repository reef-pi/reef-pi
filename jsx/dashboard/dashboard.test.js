import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store'
import Main from './main'

Enzyme.configure({ adapter: new Adapter() })
const mockStore =  configureMockStore()

describe('Dashboard', () => {
  it('<Main />', () => {
    shallow(<Main store={mockStore()}/>)
  })
})
