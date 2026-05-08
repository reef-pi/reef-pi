import React from 'react'
import ControlChart from './control_chart'
import EditTemperature from './edit_temperature'
import ReadingsChart from './readings_chart'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

const collectElements = (node, predicate, matches = []) => {
  if (!React.isValidElement(node)) {
    return matches
  }

  if (predicate(node)) {
    matches.push(node)
  }

  React.Children.forEach(node.props.children, child => collectElements(child, predicate, matches))
  return matches
}

const findFirst = (node, predicate) => collectElements(node, predicate)[0]

describe('<EditTemperature />', () => {
  let values = { chart: {} }
  let sensors = ['sensor']
  let equipment = [{ id: '1', name: 'EQ' }]
  let macros = [{ id: '1', name: 'Macro' }]
  let submitForm = jest.fn()

  const renderComponent = (extraProps = {}, valueOverrides = {}) => EditTemperature({
    values: {
      ...values,
      ...valueOverrides
    },
    errors: {},
    touched: {},
    sensors,
    equipment,
    macros,
    analogInputs: [],
    submitForm,
    handleBlur: jest.fn(),
    handleChange: jest.fn(),
    readOnly: false,
    showChart: true,
    dirty: true,
    isValid: true,
    ...extraProps
  })

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
    jest.spyOn(Alert, 'showUpdateSuccessful')
    submitForm = jest.fn()

    values = {
      id: '1',
      name: 'tc1',
      enable: true,
      one_shot: false,
      sensor: 'sensor',
      analog_input: '',
      fahrenheit: true,
      period: 60,
      min: 72,
      max: 78,
      heater: '',
      cooler: '',
      alerts: false,
      control: 'macro',
      chart: { color: '#000' }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should not show charts when showChart is false', () => {
    const element = renderComponent({ showChart: false })

    expect(collectElements(element, child => child.type === ReadingsChart)).toHaveLength(0)
    expect(collectElements(element, child => child.type === ControlChart)).toHaveLength(0)
  })

  it('should show reading charts when showChart is true but hide control chart', () => {
    const element = renderComponent()

    expect(collectElements(element, child => child.type === ReadingsChart)).toHaveLength(1)
    expect(collectElements(element, child => child.type === ControlChart)).toHaveLength(0)
  })

  it('should show both charts when heater or chiller is used', () => {
    const element = renderComponent({}, { heater: '2', cooler: '4' })

    expect(collectElements(element, child => child.type === ReadingsChart)).toHaveLength(1)
    expect(collectElements(element, child => child.type === ControlChart)).toHaveLength(1)
  })

  it('submits successfully when the form is valid', () => {
    const element = renderComponent()
    const form = findFirst(element, child => child.type === 'form')

    form.props.onSubmit({ preventDefault: jest.fn() })

    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).not.toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
  })

  it('shows alert when the form is invalid', () => {
    const element = renderComponent({ isValid: false }, { name: '', fahrenheit: false })
    const form = findFirst(element, child => child.type === 'form')

    form.props.onSubmit({ preventDefault: jest.fn() })

    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('disables control inputs when controlling nothing', () => {
    const element = renderComponent({ isValid: false }, { control: '' })
    const heaterField = findFirst(
      element,
      child => child.props.name === 'heater' && child.props.className === 'custom-select'
    )

    expect(heaterField.props.disabled).toBe(true)
  })

  it('enables control inputs when controlling equipment', () => {
    const element = renderComponent({ isValid: false }, { control: 'equipment' })
    const heaterField = findFirst(
      element,
      child => child.props.name === 'heater' && child.props.className === 'custom-select'
    )

    expect(heaterField.props.disabled).toBe(false)
  })
})
