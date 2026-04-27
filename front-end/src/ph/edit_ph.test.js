import React from 'react'
import EditPh from './edit_ph'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

describe('<EditPh />', () => {
  const flattenElements = (node) => {
    const elements = []
    const visit = child => {
      if (!child) {
        return
      }
      if (Array.isArray(child)) {
        child.forEach(visit)
        return
      }
      elements.push(child)
      if (child.props && child.props.children) {
        visit(child.props.children)
      }
    }
    visit(node)
    return elements
  }

  const findByProps = (node, props) => {
    return flattenElements(node).find(element => {
      return Object.entries(props).every(([key, value]) => element.props && element.props[key] === value)
    })
  }

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
    const wrapper = EditPh({
      values,
      probe,
      errors: {},
      touched: {},
      analogInputs,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      equipment,
      macros
    })
    expect(wrapper.type).toBe('form')
  })

  it('<EditPh /> should submit', () => {
    const wrapper = EditPh({
      values,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      errors: {},
      touched: {},
      analogInputs,
      dirty: true,
      isValid: true,
      equipment,
      macros
    })
    wrapper.props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditPh /> should show alert when invalid', () => {
    const wrapper = EditPh({
      values,
      probe,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      errors: {},
      touched: {},
      analogInputs,
      dirty: true,
      isValid: false,
      equipment,
      macros
    })
    wrapper.props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EditPh /> should disable inputs when controlling nothing', () => {
    const wrapper = EditPh({
      values: { ...values, control: '' },
      probe,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      errors: {},
      touched: {},
      analogInputs,
      dirty: true,
      isValid: false,
      equipment,
      macros
    })
    const upperFunction = findByProps(wrapper, { name: 'upperFunction', className: 'custom-select' })
    expect(upperFunction.props.disabled).toBe(true)
  })

  it('<EditPh /> should enable inputs when controlling equipment', () => {
    const wrapper = EditPh({
      values: { ...values, control: 'equipment' },
      probe,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      errors: {},
      touched: {},
      analogInputs,
      dirty: true,
      isValid: false,
      equipment,
      macros
    })
    const upperFunction = findByProps(wrapper, { name: 'upperFunction', className: 'custom-select' })
    expect(upperFunction.props.disabled).toBe(false)
  })
})
