import React from 'react'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Provider } from 'react-redux'
import { Formik, Form } from 'formik'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

import WaitStep from './wait_step'
import AlertStep from './alert_step'
import GenericStep from './generic_step'
import StepSelector from './step_selector'
import SelectType from './select_type'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

const storeState = {
  equipment: [{ id: '1', name: 'Return Pump' }],
  timers: [],
  atos: [],
  tcs: [],
  phprobes: [],
  dosers: [],
  macros: [],
  lights: []
}

// Wrap a component that needs Formik context
const withFormik = (component, initialValues = {}) => (
  <Formik initialValues={initialValues} onSubmit={() => {}}>
    <Form>{component}</Form>
  </Formik>
)

describe('Macro step components', () => {
  it('<WaitStep /> renders duration field', () => {
    const wrapper = mount(
      withFormik(
        <WaitStep name='steps[0]' errors={{}} touched={{}} readOnly={false} />,
        { 'steps[0]': { duration: 30 } }
      )
    )
    expect(wrapper.find('input').length).toBeGreaterThan(0)
  })

  it('<WaitStep /> renders in readOnly mode', () => {
    const wrapper = mount(
      withFormik(
        <WaitStep name='steps[0]' errors={{}} touched={{}} readOnly />,
        { 'steps[0]': { duration: 5 } }
      )
    )
    expect(wrapper.find('input').length).toBeGreaterThan(0)
  })

  it('<AlertStep /> renders title and message fields', () => {
    const wrapper = mount(
      withFormik(
        <AlertStep name='steps[0]' errors={{}} touched={{}} readOnly={false} />,
        { 'steps[0]': { title: '', message: '' } }
      )
    )
    expect(wrapper.find('input').length).toBeGreaterThanOrEqual(2)
  })

  it('<SelectType /> renders all valid type options', () => {
    const wrapper = mount(
      withFormik(
        <SelectType name='steps[0].type' className='custom-select' readOnly={false} />,
        { 'steps[0]': { type: 'wait' } }
      )
    )
    const options = wrapper.find('option')
    // 11 valid types + 1 placeholder
    expect(options.length).toBeGreaterThanOrEqual(11)
  })

  it('<SelectType /> renders as disabled when readOnly', () => {
    const wrapper = mount(
      withFormik(
        <SelectType name='steps[0].type' className='' readOnly />,
        { 'steps[0]': { type: 'wait' } }
      )
    )
    expect(wrapper.find('select').prop('disabled')).toBe(true)
  })

  it('<StepSelector /> returns null for undefined type', () => {
    const result = shallow(<StepSelector type={undefined} name='s' errors={{}} touched={{}} />)
    expect(result.html()).toBeNull()
  })

  it('<StepSelector /> renders WaitStep for wait type', () => {
    const wrapper = mount(
      withFormik(
        <StepSelector type='wait' name='steps[0]' errors={{}} touched={{}} />,
        { 'steps[0]': { duration: 10 } }
      )
    )
    expect(wrapper.find('input[aria-label="Duration"]').length).toBe(1)
  })

  it('<StepSelector /> renders AlertStep for alert type', () => {
    const wrapper = mount(
      withFormik(
        <StepSelector type='alert' name='steps[0]' errors={{}} touched={{}} />,
        { 'steps[0]': { title: '', message: '' } }
      )
    )
    expect(wrapper.find('input[aria-label="Title"]').length).toBe(1)
  })

  it('<StepSelector /> renders GenericStep for equipment type', () => {
    const wrapper = mount(
      <Provider store={mockStore(storeState)}>
        {withFormik(
          <StepSelector type='equipment' name='steps[0]' errors={{}} touched={{}} />,
          { 'steps[0]': { id: '1', on: true } }
        )}
      </Provider>
    )
    expect(wrapper.find('select').length).toBeGreaterThan(0)
  })

  it('<GenericStep /> renders select for equipment type', () => {
    const wrapper = mount(
      <Provider store={mockStore(storeState)}>
        {withFormik(
          <GenericStep type='equipment' name='steps[0]' errors={{}} touched={{}} />,
          { 'steps[0]': { id: '1', on: true } }
        )}
      </Provider>
    )
    expect(wrapper.find('select').length).toBeGreaterThan(0)
  })
})
