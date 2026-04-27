import React from 'react'
import EditMacro from './edit_macro'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'
import { FieldArray, Formik } from 'formik'
import TestRenderer, { act } from 'react-test-renderer'

describe('<EditMacro />', () => {
  global.IS_REACT_ACT_ENVIRONMENT = true

  const renderEditMacro = props => {
    let renderer
    act(() => {
      renderer = TestRenderer.create(
        <Formik initialValues={props.values} onSubmit={() => {}}>
          {formik => (
            <EditMacro
              {...formik}
              {...props}
              values={props.values}
            />
          )}
        </Formik>
      )
    })
    return renderer
  }
  let values = {
    enable: true,
    name: 'test macro',
    steps: [
      {
        type: 'wait',
        duration: 30
      }
    ]
  }

  let fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditMacro />', () => {
    const wrapper = renderEditMacro({
      values,
      errors: {},
      touched: {},
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn
    })
    const arrayFields = wrapper.root.findAllByType(FieldArray)
    expect(arrayFields).toHaveLength(1)
  })

  it('<EditMacro /> should submit', () => {
    const wrapper = renderEditMacro({
      values,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      errors: {},
      touched: {},
      dirty: true,
      isValid: true
    })
    wrapper.root.findByType('form').props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditMacro /> should show alert when invalid', () => {
    const wrapper = renderEditMacro({
      values,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      errors: {},
      touched: {},
      dirty: true,
      isValid: false
    })
    wrapper.root.findByType('form').props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })
})
