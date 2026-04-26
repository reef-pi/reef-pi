import React from 'react'
import { shallow, mount } from 'enzyme'
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
import PWMStep from './pwm_step'
import MacroForm from './macro_form'
import MacroSchema from './macro_schema'

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

  it('<PWMStep /> renders jack selector and value field', () => {
    const store = mockStore({ jacks: [{ id: '1', name: 'PWM Jack', pins: [1, 2] }] })
    const wrapper = mount(
      <Provider store={store}>
        {withFormik(
          <PWMStep name='steps[0]' errors={{}} touched={{}} readOnly={false} />,
          { 'steps[0]': { id: '', value: 0 } }
        )}
      </Provider>
    )
    expect(wrapper.find('select').length).toBeGreaterThan(0)
  })

  it('<PWMStep /> renders in readOnly mode', () => {
    const store = mockStore({ jacks: [{ id: '1', name: 'PWM Jack', pins: [1, 2] }] })
    const wrapper = mount(
      <Provider store={store}>
        {withFormik(
          <PWMStep name='steps[0]' errors={{}} touched={{}} readOnly />,
          { 'steps[0]': { id: '1', value: 50 } }
        )}
      </Provider>
    )
    expect(wrapper.find('select[disabled]').length).toBeGreaterThan(0)
  })

  it('<PWMStep /> renders with empty jacks', () => {
    const store = mockStore({ jacks: [] })
    const wrapper = mount(
      <Provider store={store}>
        {withFormik(
          <PWMStep name='steps[0]' errors={{}} touched={{}} readOnly={false} />,
          { 'steps[0]': { id: '', value: 0 } }
        )}
      </Provider>
    )
    expect(wrapper.find('select').length).toBeGreaterThan(0)
  })

  it('<MacroForm /> renders with macro data', () => {
    const macro = { name: 'test', enable: false, reversible: false, steps: [] }
    const wrapper = shallow(<MacroForm macro={macro} onSubmit={jest.fn()} />)
    expect(wrapper).toBeDefined()
  })

  it('<MacroForm /> renders with undefined macro (defaults)', () => {
    const wrapper = shallow(<MacroForm onSubmit={jest.fn()} />)
    expect(wrapper).toBeDefined()
  })

  it('MacroSchema validates a valid macro', () => {
    return expect(MacroSchema.isValid({ name: 'test', steps: [] })).resolves.toBe(true)
  })

  it('MacroSchema rejects missing name', () => {
    return expect(MacroSchema.isValid({ name: '', steps: [] })).resolves.toBe(false)
  })

  it('MacroSchema validates a wait step', () => {
    return expect(MacroSchema.isValid({
      name: 'test',
      steps: [{ type: 'wait', duration: 5 }]
    })).resolves.toBe(true)
  })

  it('MacroSchema rejects wait step missing duration', () => {
    return expect(MacroSchema.isValid({
      name: 'test',
      steps: [{ type: 'wait' }]
    })).resolves.toBe(false)
  })

  it('MacroSchema validates an alert step', () => {
    return expect(MacroSchema.isValid({
      name: 'test',
      steps: [{ type: 'alert', title: 'hi', message: 'msg' }]
    })).resolves.toBe(true)
  })

  it('MacroSchema validates an equipment step', () => {
    return expect(MacroSchema.isValid({
      name: 'test',
      steps: [{ type: 'equipment', id: '1', on: true }]
    })).resolves.toBe(true)
  })
})
