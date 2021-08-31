import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Form, Formik } from 'formik'
import Datepicker from './datepicker'

Enzyme.configure({ adapter: new Adapter() })

// eslint-disable-next-line react/prop-types
const FormikWrapper = ({ children }) => (
  <Formik
    initialValues={{
      mydatepicker: ''
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
