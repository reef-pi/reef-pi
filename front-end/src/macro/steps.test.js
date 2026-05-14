import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import { Formik, Form } from 'formik'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

import WaitStep from './wait_step'
import AlertStep from './alert_step'
import { RawGenericStep } from './generic_step'
import StepSelector from './step_selector'
import SelectType from './select_type'
import { RawPWMStep } from './pwm_step'
import MacroSchema from './macro_schema'
import { mapMacroPropsToValues } from './macro_form'

const mockStore = configureMockStore([])

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
const withFormik = (component, initialValues = {}, store = null) => {
  const tree = (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      <Form>{component}</Form>
    </Formik>
  )
  return store ? <Provider store={store}>{tree}</Provider> : tree
}

const renderMarkup = (component, initialValues = {}, store = null) => renderToStaticMarkup(
  withFormik(component, initialValues, store)
)

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('Macro step components', () => {
  it('<WaitStep /> renders duration field', () => {
    expect(renderMarkup(
      <WaitStep name='steps[0]' errors={{}} touched={{}} readOnly={false} />,
      { 'steps[0]': { duration: 30 } }
    )).toContain('aria-label="Duration"')
  })

  it('<WaitStep /> renders in readOnly mode', () => {
    expect(renderMarkup(
      <WaitStep name='steps[0]' errors={{}} touched={{}} readOnly />,
      { 'steps[0]': { duration: 5 } }
    )).toContain('readOnly=""')
  })

  it('<AlertStep /> renders title and message fields', () => {
    const html = renderMarkup(
      <AlertStep name='steps[0]' errors={{}} touched={{}} readOnly={false} />,
      { 'steps[0]': { title: '', message: '' } }
    )
    expect(html).toContain('aria-label="Title"')
    expect((html.match(/<input/g) || [])).toHaveLength(2)
  })

  it('<SelectType /> renders all valid type options', () => {
    const html = renderMarkup(
      <SelectType name='steps[0].type' className='custom-select' readOnly={false} />,
      { 'steps[0]': { type: 'wait' } }
    )
    expect((html.match(/<option/g) || []).length).toBeGreaterThanOrEqual(11)
  })

  it('<SelectType /> renders as disabled when readOnly', () => {
    expect(renderMarkup(
      <SelectType name='steps[0].type' className='' readOnly />,
      { 'steps[0]': { type: 'wait' } }
    )).toContain('disabled=""')
  })

  it('<StepSelector /> returns null for undefined type', () => {
    expect(StepSelector({ type: undefined, name: 's', errors: {}, touched: {} })).toBeNull()
  })

  it('<StepSelector /> renders WaitStep for wait type', () => {
    expect(renderMarkup(
      <StepSelector type='wait' name='steps[0]' errors={{}} touched={{}} />,
      { 'steps[0]': { duration: 10 } }
    )).toContain('aria-label="Duration"')
  })

  it('<StepSelector /> renders AlertStep for alert type', () => {
    expect(renderMarkup(
      <StepSelector type='alert' name='steps[0]' errors={{}} touched={{}} />,
      { 'steps[0]': { title: '', message: '' } }
    )).toContain('aria-label="Title"')
  })

  it('<StepSelector /> renders GenericStep for equipment type', () => {
    const html = renderMarkup(
      <StepSelector type='equipment' name='steps[0]' errors={{}} touched={{}} />,
      { 'steps[0]': { id: '1', on: true } },
      mockStore(storeState)
    )
    expect((html.match(/select/g) || []).length).toBeGreaterThan(0)
  })

  it('<GenericStep /> renders select for equipment type', () => {
    const html = renderMarkup(
      <RawGenericStep
        type='equipment'
        name='steps[0]'
        errors={{}}
        touched={{}}
        equipment={storeState.equipment}
      />,
      { 'steps[0]': { id: '1', on: true } }
    )
    expect((html.match(/select/g) || []).length).toBeGreaterThan(0)
  })

  it('<PWMStep /> renders jack selector and value field', () => {
    const fetch = jest.fn()
    const html = renderMarkup(
      <RawPWMStep
        name='steps[0]'
        errors={{}}
        touched={{}}
        readOnly={false}
        jacks={[{ id: '1', name: 'PWM Jack', pins: [1, 2] }]}
        fetch={fetch}
      />,
      { 'steps[0]': { id: '', value: 0 } }
    )
    expect(html).toContain('PWM Jack')
  })

  it('<PWMStep /> renders in readOnly mode', () => {
    const html = renderMarkup(
      <RawPWMStep
        name='steps[0]'
        errors={{}}
        touched={{}}
        readOnly
        jacks={[{ id: '1', name: 'PWM Jack', pins: [1, 2] }]}
        fetch={jest.fn()}
      />,
      { 'steps[0]': { id: '1', value: 50 } }
    )
    expect(html).toContain('disabled=""')
  })

  it('<PWMStep /> renders with empty jacks', () => {
    const html = renderMarkup(
      <RawPWMStep
        name='steps[0]'
        errors={{}}
        touched={{}}
        readOnly={false}
        jacks={[]}
        fetch={jest.fn()}
      />,
      { 'steps[0]': { id: '', value: 0 } }
    )
    expect(html).toContain('name="steps[0].id"')
  })

  it('<PWMStep /> fetches jacks on mount', () => {
    const fetch = jest.fn()
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(withFormik(
        <RawPWMStep
          name='steps[0]'
          errors={{}}
          touched={{}}
          readOnly={false}
          jacks={[{ id: '1', name: 'PWM Jack', pins: [1, 2] }]}
          fetch={fetch}
        />,
        { 'steps[0]': { id: '', value: 0 } }
      ))
    })

    expect(fetch).toHaveBeenCalled()
    expect(container.querySelector('select').disabled).toBe(false)
    expect(container.querySelector('input[type="number"]').getAttribute('max')).toBe('100')

    act(() => root.unmount())
  })

  it('<MacroForm /> renders with macro data', () => {
    const macro = { name: 'test', enable: false, reversible: false, steps: [] }
    expect(mapMacroPropsToValues({ macro })).toMatchObject({ name: 'test', steps: [] })
  })

  it('<MacroForm /> renders with undefined macro (defaults)', () => {
    expect(mapMacroPropsToValues({ onSubmit: jest.fn() })).toMatchObject({ name: '', steps: [] })
  })

  it('MacroSchema validates a macro with no steps', () => {
    return expect(MacroSchema.isValid({ name: 'test', steps: [] })).resolves.toBe(true)
  })

  it('MacroSchema rejects a macro without the steps array', () => {
    return expect(MacroSchema.isValid({ name: 'test' })).resolves.toBe(false)
  })

  it('MacroSchema validates a macro with multiple steps', () => {
    return expect(MacroSchema.isValid({
      name: 'test',
      steps: [
        { type: 'wait', duration: 5 },
        { type: 'alert', title: 'hi', message: 'msg' }
      ]
    })).resolves.toBe(true)
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
