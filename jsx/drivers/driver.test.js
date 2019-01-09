import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Driver from './driver'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import DriverFrom from './driver_form'

Enzyme.configure({ adapter: new Adapter() })

describe('driver UI', () => {
  it('<Driver />', () => {
    shallow(<Driver name='foo' type='bar'/>)
  })

  it('<DriverForm />', ()=>{
    const wrapper = shallow(
      <DriverFrom 
        data={{}}
        onSubmit={()=>true}
      />).instance()
    wrapper.handleSubmit()
  })
})
