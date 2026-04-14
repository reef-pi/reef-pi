import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import BooleanSelect from './boolean_select'

describe('<BooleanSelect />', () => {
  it('binds true', () => {
    let val = ''
    const field = {
      name: 'name',
      onChange: (e) => {
        val = e.target.value
      }
    }
    const html = renderToStaticMarkup(
      <BooleanSelect field={field}>
        <option value='true'>Yes</option>
        <option value='false'>No</option>
      </BooleanSelect>
    )
    expect(html).toContain('<select')

    const select = BooleanSelect({
      field,
      children: [
        <option key='true' value='true'>Yes</option>,
        <option key='false' value='false'>No</option>
      ]
    })
    select.props.onChange({ target: { name: 'name', value: 'true' } })
    expect(val).toBe(true)
  })

  it('binds false', () => {
    let val = ''
    const field = {
      name: 'name',
      onChange: (e) => {
        val = e.target.value
      }
    }
    const select = BooleanSelect({
      field,
      children: [
        <option key='true' value='true'>Yes</option>,
        <option key='false' value='false'>No</option>
      ]
    })
    select.props.onChange({ target: { name: 'name', value: 'false' } })
    expect(val).toBe(false)
  })
})
