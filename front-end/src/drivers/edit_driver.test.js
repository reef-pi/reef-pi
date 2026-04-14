import React from 'react'
import * as Alert from '../utils/alert'
import EditDriver from './edit_driver'
import 'isomorphic-fetch'

describe('<EditDriver />', () => {
  let values = {}
  let options = {
    ezo: [{ name: 'Address', default: 100, order: '1', type: 1 }],
    pca9685: [{ name: 'Frequency', default: 50, order: '1', type: 1 }]
  }
  let fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
    jest.spyOn(Alert, 'showUpdateSuccessful').mockImplementation(() => {})
    values = { name: 'drv', type: 'ezo', config: { address: '100' } }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = (overrides = {}) => EditDriver({
    values,
    errors: {},
    touched: {},
    handleBlur: fn,
    submitForm: fn,
    handleChange: fn,
    driverOptions: options,
    mode: 'create',
    isValid: true,
    dirty: false,
    readOnly: false,
    ...overrides
  })

  const flatten = (node) => {
    if (node == null || typeof node === 'boolean') return []
    if (Array.isArray(node)) return node.flatMap(flatten)
    if (typeof node !== 'object') return []
    const children = node.props && node.props.children
    return [node, ...flatten(children)]
  }

  it('<EditDriver />', () => {
    const nodes = flatten(renderComponent())
    const typeField = nodes.find(node => node.props && node.props.name === 'type')
    expect(typeField).toBeDefined()
  })

  it('submits successfully when valid', () => {
    const submitForm = jest.fn()
    const element = renderComponent({ submitForm, dirty: true, isValid: true })
    element.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('shows alert when invalid', () => {
    const submitForm = jest.fn()
    const element = renderComponent({ submitForm, dirty: true, isValid: false })
    element.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('updates config defaults when driver type changes', () => {
    const handleChange = jest.fn()
    const element = renderComponent({ handleChange })
    const nodes = flatten(element)
    const typeField = nodes.find(node => node.props && node.props.name === 'type')
    typeField.props.onChange({ target: { value: 'pca9685' } })
    expect(values.config).toEqual({ frequency: '50' })
    expect(handleChange).toHaveBeenCalled()
  })
})
