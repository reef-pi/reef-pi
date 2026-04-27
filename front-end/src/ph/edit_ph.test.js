import React from 'react'
import Chart from './chart'
import EditPh from './edit_ph'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

const findAll = (node, predicate, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (predicate(node)) {
    acc.push(node)
  }
  React.Children.toArray(node.props?.children).forEach(child => findAll(child, predicate, acc))
  return acc
}

const findFirst = (node, predicate) => findAll(node, predicate)[0]

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
    expect(() => EditPh({
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
    })).not.toThrow()
  })

  it('<EditPh /> should submit', () => {
    const submitForm = jest.fn()
    const form = EditPh({
      values,
      handleBlur: fn,
      handleChange: fn,
      submitForm,
      errors: {},
      touched: {},
      analogInputs,
      dirty: true,
      isValid: true,
      equipment,
      macros
    })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditPh /> should show alert when invalid', () => {
    const submitForm = jest.fn()
    const form = EditPh({
      values,
      probe,
      handleBlur: fn,
      handleChange: fn,
      submitForm,
      errors: {},
      touched: {},
      analogInputs,
      dirty: true,
      isValid: false,
      equipment,
      macros
    })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EditPh /> should disable inputs when controlling nothing', () => {
    values.control = ''
    const tree = EditPh({
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

    const upperFunction = findFirst(tree, node => node.props?.name === 'upperFunction' && node.props?.className === 'custom-select')
    expect(upperFunction.props.disabled).toBe(true)
  })

  it('<EditPh /> should enable inputs when controlling equipment', () => {
    values.control = 'equipment'
    const tree = EditPh({
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

    const upperFunction = findFirst(tree, node => node.props?.name === 'upperFunction' && node.props?.className === 'custom-select')
    expect(upperFunction.props.disabled).toBe(false)
  })

  it('<EditPh /> renders charts only when enabled and probe exists', () => {
    const tree = EditPh({
      values,
      probe,
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

    expect(findAll(tree, node => node.type === Chart)).toHaveLength(2)
  })
})
