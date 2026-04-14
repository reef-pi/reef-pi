import React from 'react'
import { Form, Formik } from 'formik'
import { renderToStaticMarkup } from 'react-dom/server'
import Datepicker from './datepicker'

// eslint-disable-next-line react/prop-types
const FormikWrapper = ({ children }) => (
  <Formik
    initialValues={{
      mydatepicker: ''
    }}
    onSubmit={() => {}}
  >
    <Form>
      {children}
    </Form>
  </Formik>
)

describe('<Datepicker />', () => {
  it('renders inside Formik', () => {
    expect(() => renderToStaticMarkup(
      <FormikWrapper>
        <Datepicker name='mydatepicker' />
      </FormikWrapper>
    )).not.toThrow()
  })
})
