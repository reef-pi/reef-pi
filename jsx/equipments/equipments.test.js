import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import Equipment from './equipment'
import Chart from './chart'
import Main from './main'
import configureMockStore from 'redux-mock-store'

Enzyme.configure({ adapter: new Adapter() })
const mockStore =  configureMockStore()

describe('Equipment ui', () => {
  it('<Main />', () => {
    shallow(<Main store={mockStore()}/>)
  })

  it('<Equipment />', () => {
    shallow(<Equipment outlet={{}}/>)
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore()}/>)
  })
})

