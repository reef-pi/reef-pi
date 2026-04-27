import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Form, Formik } from 'formik'
import Datepicker from './datepicker'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

jest.mock('react-datepicker', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: props => React.createElement('input', { ...props, 'data-testid': 'datepicker' }),
    registerLocale: jest.fn()
  }
})

describe('<Datepicker />', () => {
  it('should render inside a Formik form', () => {
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(
        <Formik initialValues={{ mydatepicker: '' }}>
          <Form>
            <Datepicker name='mydatepicker' />
          </Form>
        </Formik>
      )
    })

    expect(container.querySelector('[data-testid="datepicker"]')).toBeDefined()

    act(() => {
      root.unmount()
    })
  })
})
