import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import EditPh from './edit_ph'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

Enzyme.configure({ adapter: new Adapter() })

describe('<EditPh />', () => {
  let values = { enable: true, control: 'macro', chart: {color: '#000'} }
  let probe = { id: 1, chart: {color: '#000'}}
  let fn = jest.fn()
  let analogInputs = [{
    id:'1',
    name:'AI1',
    pin:0,
    driver:'2'
  }]
  let equipment = [{id: 1, name: 'equipment'}]
  let macros = [{id: 1, name: 'macro'}]

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditPh /> mount', () => {
    shallow(
      <EditPh
        values={values}
        probe={probe}
        errors={{}}
        touched={{}}
        analogInputs={analogInputs}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        equipment={equipment}
        macros={macros}
      />
    )
  })

  it('<EditPh /> should submit', () => {
    const wrapper = shallow(
      <EditPh
        values={values}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        analogInputs={analogInputs}
        dirty
        isValid
        equipment={equipment}
        macros={macros}
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditPh /> should show alert when invalid', () => {

    const wrapper = shallow(
      <EditPh
        values={values}
        probe={probe}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        analogInputs={analogInputs}
        dirty
        isValid={false}
        equipment={equipment}
        macros={macros}
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EditPh /> should disable inputs when controlling nothing', () => {

    values.control = 'nothing'

    const wrapper = shallow(
      <EditPh
        values={values}
        probe={probe}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        analogInputs={analogInputs}
        dirty
        isValid={false}
        equipment={equipment}
        macros={macros}
      />
    )

    const upperFunction = wrapper.find({name: 'upperFunction', className: 'custom-select'})
    expect(upperFunction.prop('disabled')).toBe(true)
  })


  it('<EditPh /> should enable inputs when controlling equipment', () => {

    values.control = 'equipment'

    const wrapper = shallow(
      <EditPh
        values={values}
        probe={probe}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        analogInputs={analogInputs}
        dirty
        isValid={false}
        equipment={equipment}
        macros={macros}
      />
    )

    const upperFunction = wrapper.find({name: 'upperFunction', className: 'custom-select'})
    //upperFunction.dive()
    expect(upperFunction.prop('disabled')).toBe(false)
  })

})
