import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import EditPh from './edit_ph'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

Enzyme.configure({ adapter: new Adapter() })

describe('<EditPh />', () => {
  var values = {enable: true}
  var probe = {id: 1}
  var fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditPh />', () => {
    shallow(
      <EditPh values={values}
        probe={probe}
        errors={{}}
        touched={{}}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn} />
    )
  })

  it('<EditPh /> should submit', () => {
    const wrapper = shallow(
      <EditPh values={values}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        dirty
        isValid />
    )
    wrapper.find('form').simulate('submit', {preventDefault: () => {}})
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditPh /> should show alert when invalid', () => {
    const wrapper = shallow(
      <EditPh values={values}
        probe={probe}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        dirty
        isValid={false} />
    )
    wrapper.find('form').simulate('submit', {preventDefault: () => {}})
    expect(Alert.showError).toHaveBeenCalled()
  })
})
