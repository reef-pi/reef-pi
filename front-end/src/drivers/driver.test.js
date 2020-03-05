import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Driver from './driver'
import Adapter from 'enzyme-adapter-react-16'
import 'isomorphic-fetch'
import DriverFrom from './driver_form'

Enzyme.configure({ adapter: new Adapter() })

describe('driver UI', () => {

  let driver = {
    id: 1,
    name: 'test',
    type: 'pca9685',
    config: {
      address: 45,
      freqency: 1000
    }
  }

  it('<Driver />', () => {
    shallow(
      <Driver
        driver={driver}
        remove={() => true}
        update={() => true}
      />)
  })

  it('<DriverForm />', () => {
    const wrapper = shallow(
      <DriverFrom
        data={{}}
        onSubmit={() => true}
      />).instance()
    wrapper.handleSubmit()
  })
})
