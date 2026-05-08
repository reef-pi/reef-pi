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
  const values = { enable: true, control: 'macro', chart: { color: '#000' } }
  const probe = { id: 1, chart: { color: '#000' } }
  const fn = jest.fn()
  const analogInputs = [{
    id: '1',
    name: 'AI1',
    pin: 0,
    driver: '2'
  }]
  const equipment = [{ id: 1, name: 'equipment' }]
  const macros = [{ id: 1, name: 'macro' }]

  const renderEditPh = (overrides = {}) => {
    const {
      values: valueOverrides = {},
      submitForm = fn,
      isValid = false,
      dirty = true,
      ...props
    } = overrides
    return EditPh({
      values: { ...values, ...valueOverrides },
      probe,
      handleBlur: fn,
      handleChange: fn,
      submitForm,
      errors: {},
      touched: {},
      analogInputs,
      dirty,
      isValid,
      equipment,
      macros,
      ...props
    })
  }

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditPh /> mount', () => {
    expect(() => renderEditPh({ dirty: undefined, isValid: undefined })).not.toThrow()
  })

  it('<EditPh /> should submit', () => {
    const submitForm = jest.fn()
    const form = renderEditPh({ submitForm, isValid: true })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditPh /> should show alert when invalid', () => {
    const submitForm = jest.fn()
    const form = renderEditPh({ submitForm })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EditPh /> should disable inputs when controlling nothing', () => {
    const tree = renderEditPh({ values: { control: '' } })

    const upperFunction = findFirst(tree, node => node.props?.name === 'upperFunction' && node.props?.className === 'custom-select')
    expect(upperFunction.props.disabled).toBe(true)
  })

  it('<EditPh /> should enable inputs when controlling equipment', () => {
    const tree = renderEditPh({ values: { control: 'equipment' } })

    const upperFunction = findFirst(tree, node => node.props?.name === 'upperFunction' && node.props?.className === 'custom-select')
    expect(upperFunction.props.disabled).toBe(false)
  })

  it('<EditPh /> renders charts only when enabled and probe exists', () => {
    const tree = renderEditPh({ isValid: true })

    expect(findAll(tree, node => node.type === Chart)).toHaveLength(2)
  })
})
