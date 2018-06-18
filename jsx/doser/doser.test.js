import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import Pump from './pump'
import New from './new'
import Main from './controller'
import configureMockStore from 'redux-mock-store'

Enzyme.configure({ adapter: new Adapter() })
const mockStore =  configureMockStore()

describe('Doser ui', () => {
  it('<Main />', () => {
    shallow(<Main store={mockStore()}/>)
  })

  it('<New />', () => {
    shallow(<New store={mockStore()}/>)
  })

  it('<Pump />', () => {
    shallow(<Pump store={mockStore()}/>)
  })
})

