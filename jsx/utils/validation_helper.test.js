import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import * as v from './validation_helper'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

describe('Validation Helper', () => {
  it('NameFor', () => {
    const name = v.NameFor('prefix', 'name')
    expect(name).toBe('prefix.name')
  })

  it('ShowError should be falsy if there is no error', () => {
    const errors = {field2: 'some error'}
    const touched = {field1: true, field2: false}
    const result = v.ShowError('field1', touched, errors)
    expect(result).toBeFalsy()
  })

  it('ShowError should be falsy if not touched', () => {
    const errors = {field1: 'some error'}
    const touched = {field1: false, field2: false}
    const result = v.ShowError('field1', touched, errors)
    expect(result).toBeFalsy()
  })

  it('ShowError should be truthy if error exists and touched', () => {
    const errors = {field1: 'some error'}
    const touched = {field1: true}
    const result = v.ShowError('field1', touched, errors)
    expect(result).toBeTruthy()
  })

  it('Should get the error that exists', () => {
    const errors = {field1: 'some error'}
    const result = v.ErrorMessage(errors, 'field1')
    expect(result).toBe('some error')
  })

  it('Should get null if there is no error', () => {
    const errors = {field2: 'some error'}
    const result = v.ErrorMessage(errors, 'field1')
    expect(result).toBeNull()
  })

  it('Should get the first error for an array', () => {
    const errors = {field1: [null, null, 'some error', 'error 2']}
    const result = v.ErrorMessage(errors, 'field1')
    expect(result).toBe('some error')
  })

  it('Should resolve a path to object reference', () => {
    const obj = {a: {b: {c: 'got it'}}}
    const actual = v.PathToObject('a.b.c', obj)
    expect(actual).toBe('got it')
  })

  it('<ErrorFor /> with error', () => {
    const errors = {field1: [null, null, 'some error', 'error 2']}
    const touched = {field1: true}

    shallow(<v.ErrorFor name='field1' touched={touched} errors={errors} />)
  })

  it('<ErrorFor /> without error', () => {
    const errors = {field2: [null, null, 'some error', 'error 2']}
    const touched = {field1: true}

    shallow(<v.ErrorFor name='field1' touched={touched} errors={errors} />)
  })
})
