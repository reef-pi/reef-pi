import React from 'react'
import BooleanFormSelect from './boolean_form_select'

describe('<BooleanFormSelect />', () => {
  const render = (value, onChange) => BooleanFormSelect({
    name: 'enable',
    value,
    onChange,
    children: [<option key='t' value='true'>Yes</option>, <option key='f' value='false'>No</option>]
  })

  it('shows the boolean value as the matching option', () => {
    expect(render(true, jest.fn()).props.value).toBe('true')
    expect(render(false, jest.fn()).props.value).toBe('false')
  })

  it('reports booleans, not strings, to the form', () => {
    const onChange = jest.fn()
    render(true, onChange).props.onChange({ target: { name: 'enable', value: 'false' } })
    render(false, onChange).props.onChange({ target: { name: 'enable', value: 'true' } })
    expect(onChange).toHaveBeenNthCalledWith(1, { target: { name: 'enable', value: false } })
    expect(onChange).toHaveBeenNthCalledWith(2, { target: { name: 'enable', value: true } })
  })
})
