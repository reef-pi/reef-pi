import React from 'react'
import ControlChart from './control_chart'
import EditTemperature from './edit_temperature'
import ReadingsChart from './readings_chart'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

describe('<EditTemperature />', () => {
  let values = { chart: {} }
  let sensors = [{ id: 'sensor' }]
  let equipment = [{ id: '1', name: 'EQ' }]
  let macros = [{ id: '1', name: 'Macro' }]
  let fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
    jest.spyOn(Alert, 'showUpdateSuccessful').mockImplementation(() => {})

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
      chart: { color: '#000', ymin: 72, ymax: 78 }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = (overrides = {}) => EditTemperature({
    values,
    sensors,
    analogInputs: [],
    equipment,
    macros,
    errors: {},
    touched: {},
    handleBlur: fn,
    handleChange: fn,
    submitForm: fn,
    showChart: true,
    dirty: false,
    isValid: true,
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

  it('should not show charts when showChart is false', () => {
    const element = renderComponent({ showChart: false })
    const nodes = flatten(element)
    expect(nodes.filter(node => node.type === ReadingsChart)).toHaveLength(0)
    expect(nodes.filter(node => node.type === ControlChart)).toHaveLength(0)
  })

  it('should show reading charts when showChart is true but hide control chart', () => {
    const element = renderComponent()
    const nodes = flatten(element)
    expect(nodes.filter(node => node.type === ReadingsChart)).toHaveLength(1)
    expect(nodes.filter(node => node.type === ControlChart)).toHaveLength(0)
  })

  it('should show both charts when heater or chiller is used', () => {
    values.heater = '2'
    values.cooler = '4'

    const element = renderComponent()
    const nodes = flatten(element)
    expect(nodes.filter(node => node.type === ReadingsChart)).toHaveLength(1)
    expect(nodes.filter(node => node.type === ControlChart)).toHaveLength(1)
  })

  it('<EditEquipment /> should submit', () => {
    const submitForm = jest.fn()
    const element = renderComponent({ submitForm, dirty: true, isValid: true })
    element.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditEquipment /> should show alert when invalid', () => {
    values.name = ''
    values.fahrenheit = false
    const submitForm = jest.fn()
    const element = renderComponent({ submitForm, dirty: true, isValid: false })
    element.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EditEquipment /> should disable inputs when controlling nothing', () => {
    values.control = ''
    const nodes = flatten(renderComponent())
    const heaterField = nodes.find(node => node.props && node.props.name === 'heater' && node.props.className === 'custom-select')
    expect(heaterField.props.disabled).toBe(true)
  })

  it('<EditEquipment /> should enable inputs when controlling equipment', () => {
    values.control = 'equipment'
    const nodes = flatten(renderComponent())
    const heaterField = nodes.find(node => node.props && node.props.name === 'heater' && node.props.className === 'custom-select')
    expect(heaterField.props.disabled).toBe(false)
  })
})
