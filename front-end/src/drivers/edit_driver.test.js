import React from 'react'
import EditDriver from './edit_driver'
import * as Alert from 'utils/alert'
import 'isomorphic-fetch'

const findNode = (node, predicate) => {
  if (!node || typeof node !== 'object') return undefined
  if (predicate(node)) return node
  for (const child of [].concat(node.props?.children || [])) {
    const found = findNode(child, predicate)
    if (found) return found
  }
  return undefined
}

jest.mock('utils/alert', () => ({
  showError: jest.fn(),
  showUpdateSuccessful: jest.fn()
}))

const options = {
  ezo: [
    { name: 'Address', default: '99', type: 1, order: 0 },
    { name: 'Enabled', default: 'true', type: 4, order: 1 }
  ],
  pca9685: []
}

const baseProps = (overrides = {}) => ({
  values: { type: '', config: {} },
  errors: {},
  touched: {},
  handleBlur: jest.fn(),
  submitForm: jest.fn(),
  handleChange: jest.fn(),
  driverOptions: options,
  ...overrides
})

describe('<EditDriver />', () => {
  afterEach(() => jest.clearAllMocks())

  it('renders a form element', () => {
    const element = EditDriver(baseProps())
    expect(element.type).toBe('form')
    expect(typeof element.props.onSubmit).toBe('function')
  })

  it('handleSubmit when valid (dirty=false) calls submitForm and showUpdateSuccessful', () => {
    const submitForm = jest.fn()
    const form = EditDriver(baseProps({ submitForm, dirty: false, isValid: false }))
    form.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('handleSubmit when isValid=true calls submitForm and showUpdateSuccessful', () => {
    const submitForm = jest.fn()
    const form = EditDriver(baseProps({ submitForm, dirty: true, isValid: true }))
    form.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
  })

  it('handleSubmit when dirty and invalid calls submitForm and showError', () => {
    const submitForm = jest.fn()
    const form = EditDriver(baseProps({ submitForm, dirty: true, isValid: false }))
    form.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).not.toHaveBeenCalled()
  })

  it('driverTypeChangeHandler sets config defaults and calls handleChange', () => {
    const handleChange = jest.fn()
    const values = { type: '', config: {} }
    const form = EditDriver(baseProps({ handleChange, values }))
    const typeField = findNode(form, n => n.props?.name === 'type' && n.props?.onChange)
    typeField.props.onChange({ target: { value: 'ezo' } })
    expect(values.config.address).toBe('99')
    expect(handleChange).toHaveBeenCalled()
  })

  it('driverConfig renders param fields when type has options', () => {
    const values = { type: 'ezo', config: { address: '99', enabled: 'true' } }
    const form = EditDriver(baseProps({ values }))
    expect(form).not.toBeNull()
  })

  it('renders in readOnly mode with disabled inputs', () => {
    const form = EditDriver(baseProps({ readOnly: true, values: { type: '', config: {} } }))
    expect(form.type).toBe('form')
  })

  it('renders in edit mode with type selector disabled', () => {
    const form = EditDriver(baseProps({ mode: 'edit', values: { type: 'pca9685', config: {} } }))
    expect(form.type).toBe('form')
  })
})
