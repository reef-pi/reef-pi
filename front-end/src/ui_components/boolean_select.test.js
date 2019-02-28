import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import BooleanSelect from './boolean_select'

Enzyme.configure({ adapter: new Adapter() })

describe('<BooleanSelect />', () => {
  it('<BooleanSelect /> should bind true', () => {
    let val = ''
    const field = {
      name: 'name',
      onChange: (e) => {
        val = e.target.value
      }
    }
    const wrapper = shallow(
      <BooleanSelect field={field}>
        <option value='true'>Yes</option>
        <option value='false'>No</option>
      </BooleanSelect>
    )
    wrapper.find('select').simulate('change', { target: { value: 'true' } })
    expect(val).toBe(true)
  })

  it('<BooleanSelect /> should bind false', () => {
    let val = ''
    const field = {
      name: 'name',
      onChange: (e) => {
        val = e.target.value
      }
    }
    const wrapper = shallow(
      <BooleanSelect field={field}>
        <option value='true'>Yes</option>
        <option value='false'>No</option>
      </BooleanSelect>
    )
    wrapper.find('select').simulate('change', { target: { value: 'false' } })
    expect(val).toBe(false)
  })
})
