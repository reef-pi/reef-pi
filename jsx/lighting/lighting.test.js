import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import Channel from './channel'
import Chart from './chart'
import Main from './main'
import Light from './light'
import Slider from './slider'
import configureMockStore from 'redux-mock-store'

Enzyme.configure({ adapter: new Adapter() })
const mockStore =  configureMockStore()

describe('Lighting ui', () => {
  it('<Main />', () => {
    shallow(<Main store={mockStore()}/>)
  })

  it('<Light />', () => {
    shallow(<Light config={{}}/>)
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore({lights: []})}/>)
  })

  it('<Channel />', () => {
    shallow(<Channel ch={{values: []}}/>)
  })

  it('<Slider />', () => {
    shallow(<Slider getValue={()=>{[]}}/>)
  })
})

