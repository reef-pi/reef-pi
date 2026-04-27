import React from 'react'
import ControlChart from './control_chart'
import EditTemperature from './edit_temperature'
import ReadingsChart from './readings_chart'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

describe('<EditTemperature />', () => {
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

  const findByType = (node, type) => flattenElements(node).filter(element => element.type === type)
  const findByProps = (node, props) => flattenElements(node).find(element => {
    return Object.entries(props).every(([key, value]) => element.props && element.props[key] === value)
  })

  let values = { chart: {} }
  let sensors = [{ id: 'sensor' }]
  let equipment = [{ id: '1', name: 'EQ' }]
  let macros = [{ id: '1', name: 'Macro' }]
  let fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')

    values = {
      id: '1',
      name: 'tc1',
      enable: true,
      one_shot: false,
      sensor: 'sensor',
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
    const wrapper = EditTemperature({
      values,
      sensors,
      equipment,
      macros,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      showChart: false
    })

    expect(findByType(wrapper, ReadingsChart)).toHaveLength(0)
    expect(findByType(wrapper, ControlChart)).toHaveLength(0)
  })

  it('should show reading charts when showChart is true but hide control chart', () => {
    const wrapper = EditTemperature({
      values,
      sensors,
      equipment,
      macros,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      showChart: true
    })

    expect(findByType(wrapper, ReadingsChart)).toHaveLength(1)
    expect(findByType(wrapper, ControlChart)).toHaveLength(0)
  })

  it('should show both charts when heater or chiller is used', () => {
    values.heater = '2'
    values.cooler = '4'

    const wrapper = EditTemperature({
      values,
      sensors,
      equipment,
      macros,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      showChart: true
    })

    expect(findByType(wrapper, ReadingsChart)).toHaveLength(1)
    expect(findByType(wrapper, ControlChart)).toHaveLength(1)
  })

  it('<EditEquipment /> should submit', () => {
    const wrapper = EditTemperature({
      values,
      sensors,
      equipment,
      macros,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      showChart: true,
      dirty: true,
      isValid: true
    })
    wrapper.props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditEquipment /> should show alert when invalid', () => {
    values.name = ''
    values.fahrenheit = false
    const wrapper = EditTemperature({
      values,
      sensors,
      equipment,
      macros,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      showChart: true,
      dirty: true,
      isValid: false
    })
    wrapper.props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EditEquipment /> should disable inputs when controlling nothing', () => {
    values.control = ''

    const wrapper = EditTemperature({
      values,
      sensors,
      equipment,
      macros,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      showChart: true,
      dirty: true,
      isValid: false
    })

    const upperFunction = findByProps(wrapper, { name: 'heater', className: 'custom-select' })
    expect(upperFunction.props.disabled).toBe(true)
  })

  it('<EditEquipment /> should enable inputs when controlling equipment', () => {
    values.control = 'equipment'

    const wrapper = EditTemperature({
      values,
      sensors,
      equipment,
      macros,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      showChart: true,
      dirty: true,
      isValid: false
    })

    const upperFunction = findByProps(wrapper, { name: 'heater', className: 'custom-select' })
    expect(upperFunction.props.disabled).toBe(false)
  })
})
