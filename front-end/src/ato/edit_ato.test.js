import React from 'react'
import EditAto from './edit_ato'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

const findFieldByName = (node, name) => {
  if (!node || typeof node !== 'object') {
    return null
  }

  if (node.props && node.props.name === name) {
    return node
  }

  const children = React.Children.toArray(node.props?.children)
  for (const child of children) {
    const found = findFieldByName(child, name)
    if (found) {
      return found
    }
  }

  return null
}

describe('<EditAto />', () => {
  const inlets = [{ id: '1', name: 'inlet 1' }]
  const equipment = [{ id: '1', name: 'EQ' }]
  const submitForm = jest.fn()

  const baseValues = {
    id: '',
    name: 'ATO 1',
    inlet: '1',
    period: 10,
    debounce: 1,
    enable: true,
    control: '',
    pump: '',
    one_shot: false,
    notify: true,
    maxAlert: 120,
    disable_on_alert: false
  }

  const renderComponent = (props = {}) =>
    EditAto({
      values: baseValues,
      errors: {},
      touched: {},
      inlets,
      equipment,
      macros: [],
      handleBlur: jest.fn(),
      handleChange: jest.fn(),
      submitForm,
      isValid: true,
      dirty: true,
      readOnly: false,
      ...props
    })

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
    jest.spyOn(Alert, 'showUpdateSuccessful')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders a form', () => {
    const element = renderComponent()

    expect(element.type).toBe('form')
    expect(findFieldByName(element, 'name')).not.toBeNull()
    expect(findFieldByName(element, 'inlet')).not.toBeNull()
  })

  it('submits when valid', () => {
    const element = renderComponent({ dirty: true, isValid: true })

    element.props.onSubmit({ preventDefault: jest.fn() })

    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('shows an alert when invalid', () => {
    const element = renderComponent({
      values: { ...baseValues, name: '' },
      dirty: true,
      isValid: false
    })

    element.props.onSubmit({ preventDefault: jest.fn() })

    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).not.toHaveBeenCalled()
  })

  it('disables the pump selector until a control target is chosen', () => {
    const element = renderComponent()
    const pumpField = findFieldByName(element, 'pump')

    expect(pumpField.props.disabled).toBe(true)

    const withControl = renderComponent({
      values: { ...baseValues, control: 'equipment' }
    })

    expect(findFieldByName(withControl, 'pump').props.disabled).toBe(false)
  })
})
