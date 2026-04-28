import React from 'react'
import EditDriver from './edit_driver'
import 'isomorphic-fetch'

describe('<EditDriver />', () => {
  const values = {}
  const options = {
    ezo: [],
    pca9685: []
  }
  const fn = jest.fn()

  it('<EditDriver />', () => {
    const element = EditDriver({
      values,
      errors: {},
      touched: {},
      handleBlur: fn,
      submitForm: fn,
      handleChange: fn,
      driverOptions: options
    })
    expect(element.type).toBe('form')
    expect(typeof element.props.onSubmit).toBe('function')
  })
})
