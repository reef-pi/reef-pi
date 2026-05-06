import React from 'react'
import ManualLight from './manual_light'
import 'isomorphic-fetch'

describe('Lighting ui - Manual Control', () => {
  const light = {
    id: '1',
    channels: {
      '0': { value: 10 },
      '1': { value: 20 }
    }
  }

  const countByType = (node, predicate) => {
    if (!node || typeof node !== 'object') {
      return 0
    }
    let count = predicate(node) ? 1 : 0
    React.Children.toArray(node.props?.children).forEach(child => {
      count += countByType(child, predicate)
    })
    return count
  }

  it('<ManualLight /> should show a slider for each channel', () => {
    const component = new ManualLight({
      light,
      handleChange: jest.fn()
    })

    expect(countByType(component.render(), node => node.type === 'input' && node.props.type === 'range')).toBe(2)
  })

  it('<ManualLight /> should not raise a change for alpha values', () => {
    const handleChange = jest.fn()
    const component = new ManualLight({
      light,
      handleChange
    })
    component.setState = jest.fn(next => {
      component.state = { ...component.state, ...next }
    })

    component.handleValueChange({
      target: {
        name: '0',
        value: 'abc'
      }
    })
    expect(component.state.channels[0].value).toBe(10)
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('<ManualLight /> should raise a change for numeric values', () => {
    const handleChange = jest.fn()
    const component = new ManualLight({
      light: JSON.parse(JSON.stringify(light)),
      handleChange
    })
    component.setState = jest.fn(next => {
      component.state = { ...component.state, ...next }
    })
    component.debouncedChange = jest.fn()

    component.handleValueChange({
      target: {
        name: '0',
        value: '44.5'
      }
    })
    expect(component.state.channels[0].value).toBe('44.5')
    expect(component.debouncedChange).toHaveBeenCalledWith('0', 44.5)
  })

  it('<ManualLight /> should update channel state without mutating existing channel objects', () => {
    const handleChange = jest.fn()
    const component = new ManualLight({
      light: JSON.parse(JSON.stringify(light)),
      handleChange
    })
    component.setState = jest.fn(next => {
      component.state = { ...component.state, ...next }
    })
    component.debouncedChange = jest.fn()
    const previousChannel = component.state.channels[0]

    component.handleValueChange({
      target: {
        name: '0',
        value: '44.5'
      }
    })

    expect(previousChannel.value).toBe(10)
    expect(component.state.channels[0]).not.toBe(previousChannel)
    expect(component.state.channels[0].value).toBe('44.5')
  })

  it('<ManualLight /> should emit updated light values without mutating props', () => {
    const handleChange = jest.fn()
    const originalLight = JSON.parse(JSON.stringify(light))
    const component = new ManualLight({
      light: originalLight,
      handleChange
    })
    const previousChannel = originalLight.channels[0]

    component.updateLight('0', '44.5')

    expect(originalLight.channels[0].value).toBe(10)
    expect(handleChange).toHaveBeenCalledWith('1', {
      ...originalLight,
      channels: {
        ...originalLight.channels,
        0: {
          ...originalLight.channels[0],
          value: 44.5
        }
      }
    })
    expect(handleChange.mock.calls[0][1]).not.toBe(originalLight)
    expect(handleChange.mock.calls[0][1].channels[0]).not.toBe(previousChannel)
  })
})
