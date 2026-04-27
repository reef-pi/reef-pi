import React from 'react'
import { shallow } from 'enzyme'
import EditTimer from './edit_timer'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

const findAll = (node, predicate, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (predicate(node)) {
    acc.push(node)
  }
  const children = node.props?.children
  if (children !== undefined) {
    ;[].concat(children).forEach(child => findAll(child, predicate, acc))
  }
  return acc
}

describe('<EditTimer />', () => {
  let values = { type: 'equipment', target: {} }
  let equipment = [{ id: '1', name: 'EQ' }]
  let macros = [{ id: '1', name: 'EQ' }]
  let fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditTimer />', () => {
    expect(() => EditTimer({
      values,
      errors: {},
      touched: {},
      equipment,
      macros,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn
    })).not.toThrow()
  })

  it('<EditTimer /> should submit', () => {
    const form = EditTimer({
      values,
      equipment,
      macros,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      errors: {},
      touched: {},
      dirty: true,
      isValid: true,
      showChart: false
    })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditTimer /> should show alert when invalid', () => {
    const form = EditTimer({
      values: { ...values, type: 'reminder', name: '' },
      equipment,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      macros,
      showChart: true,
      errors: {},
      touched: {},
      dirty: true,
      isValid: false
    })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('EditTimer /> should set macro target when macro is selected', () => {
    const changeHandler = jest.fn()
    const typeField = findAll(EditTimer({
      values: { ...values, type: 'macro' },
      equipment,
      handleBlur: fn,
      handleChange: changeHandler,
      submitForm: fn,
      macros,
      showChart: true,
      errors: {},
      touched: {},
      dirty: true,
      isValid: false
    }),
      node => node.props?.name === 'type'
    )[0]

    typeField.props.onChange({ target: { name: 'type', value: 'macro' } })

    expect(changeHandler.mock.calls.length).toBe(2)
    expect(changeHandler.mock.calls[1][0].target.value).toEqual({ id: '' })
  })

  it('EditTimer /> should set equipment target when equipment is selected', () => {
    const changeHandler = jest.fn()
    const typeField = findAll(EditTimer({
      values: { ...values, type: 'equipment' },
      equipment,
      handleBlur: fn,
      handleChange: changeHandler,
      submitForm: fn,
      macros,
      showChart: true,
      errors: {},
      touched: {},
      dirty: true,
      isValid: false
    }), node => node.props?.name === 'type')[0]

    typeField.props.onChange({ target: { name: 'type', value: 'equipment' } })

    expect(changeHandler.mock.calls.length).toBe(2)
    expect(changeHandler.mock.calls[1][0].target.value).toEqual({ id: '', on: true, revert: true, duration: 60 })
  })

  it('EditTimer /> should set reminder target when reminder is selected', () => {
    const changeHandler = jest.fn()
    const typeField = findAll(EditTimer({
      values,
      equipment,
      handleBlur: fn,
      handleChange: changeHandler,
      submitForm: fn,
      macros,
      showChart: true,
      errors: {},
      touched: {},
      dirty: true,
      isValid: false
    }), node => node.props?.name === 'type')[0]

    typeField.props.onChange({ target: { name: 'type', value: 'reminder' } })

    expect(changeHandler.mock.calls.length).toBe(2)
    expect(changeHandler.mock.calls[1][0].target.value).toEqual({ title: '', message: '' })
  })

  it('EditTimer /> should set lightings target with correct defaults when lightings is selected', () => {
    const changeHandler = jest.fn()
    const typeField = findAll(EditTimer({
      values: { ...values, type: 'lightings' },
      equipment,
      handleBlur: fn,
      handleChange: changeHandler,
      submitForm: fn,
      macros,
      showChart: true,
      errors: {},
      touched: {},
      dirty: true,
      isValid: false
    }), node => node.props?.name === 'type')[0]

    typeField.props.onChange({ target: { name: 'type', value: 'lightings' } })

    expect(changeHandler.mock.calls.length).toBe(2)
    expect(changeHandler.mock.calls[1][0].target.value).toEqual({ id: '', on: true, revert: false, duration: 60 })
  })
})
