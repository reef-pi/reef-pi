import React from 'react'
import { mount } from 'enzyme'
import { Form, Formik } from 'formik'
import Datepicker from './datepicker'


// eslint-disable-next-line react/prop-types
const FormikWrapper = ({ children }) => (
  <Formik
    initialValues={{
      mydatepicker: '',
    }}
  >
    <Form>
      {children}
    </Form>
  </Formik>
)

describe('<Datepicker />', () => {

  it('should render', () => {
    const wrapper = mount(
      <FormikWrapper>
        <Datepicker name='mydatepicker' />
      </FormikWrapper>
    )

    expect(wrapper).toBeDefined()
  })

})
