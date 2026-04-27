import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Formik } from 'formik'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import EditMacro from './edit_macro'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const mockStore = configureMockStore([thunk])

const renderMacro = props => {
  const container = document.createElement('div')
  const root = createRoot(container)
  const store = mockStore({ equipment: [], macros: [], lights: [], atos: [], tcs: [], phprobes: [], cameras: [], dosers: [] })

  act(() => {
    root.render(
      <Provider store={store}>
        <Formik initialValues={props.values} onSubmit={() => {}}>
          <EditMacro {...props} />
        </Formik>
      </Provider>
    )
  })

  return {
    container,
    unmount: () => act(() => root.unmount())
  }
}

describe('<EditMacro />', () => {
  let values = {
    enable: true,
    name: 'test macro',
    steps: [
      {
        type: 'wait',
        duration: 30
      },
      {
        type: 'equipment',
        id: '1',
        on: true
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
    const { container, unmount } = renderMacro({
      values,
      errors: {},
      touched: {},
      onBlur: fn,
      handleChange: fn,
      submitForm: fn
    })
    expect(container.querySelectorAll('.macro-step').length).toBe(2)
    unmount()
  })

  it('<EditMacro /> should submit', () => {
    const submitForm = jest.fn()
    const { container, unmount } = renderMacro({
      values,
      onBlur: fn,
      handleChange: fn,
      submitForm,
      errors: {},
      touched: {},
      dirty: true,
      isValid: true
    })

    act(() => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).not.toHaveBeenCalled()
    unmount()
  })

  it('<EditMacro /> should show alert when invalid', () => {
    const submitForm = jest.fn()
    const { container, unmount } = renderMacro({
      values,
      onBlur: fn,
      handleChange: fn,
      submitForm,
      errors: {},
      touched: {},
      dirty: true,
      isValid: false
    })

    act(() => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
    unmount()
  })
})
