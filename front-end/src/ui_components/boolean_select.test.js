import React from 'react'
import BooleanSelect from './boolean_select'

describe('<BooleanSelect />', () => {
  it('<BooleanSelect /> should bind true', () => {
    let val = ''
    const field = {
      name: 'name',
      onChange: (e) => {
        val = e.target.value
      }
    }
    const element = BooleanSelect({
      field,
      children: [
        <option key='true' value='true'>Yes</option>,
        <option key='false' value='false'>No</option>
      ]
    })

    element.props.onChange({ target: { name: 'name', value: 'true' } })
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
    const element = BooleanSelect({
      field,
      children: [
        <option key='true' value='true'>Yes</option>,
        <option key='false' value='false'>No</option>
      ]
    })

    element.props.onChange({ target: { name: 'name', value: 'false' } })
    expect(val).toBe(false)
  })
})
