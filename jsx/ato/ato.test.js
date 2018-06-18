import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import ATO from './ato'
import New from './new'
import Main from './main'
import Chart from './chart'
import configureMockStore from 'redux-mock-store'

Enzyme.configure({ adapter: new Adapter() })
const mockStore =  configureMockStore()

describe('ATO ui', () => {
  it('<ATO />', () => {
    shallow(<ATO store={mockStore()}/>)
  })

  it('<New />', () => {
    shallow(<New store={mockStore()}/>)
  })

  it('<Main />', () => {
    shallow(<Main store={mockStore()}/>)
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore({ato_usage: {}})}/>)
  })
})
