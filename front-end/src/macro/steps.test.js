import React from 'react'
import { Formik, Form } from 'formik'
import { renderToStaticMarkup } from 'react-dom/server'
import 'isomorphic-fetch'

import WaitStep from './wait_step'
import AlertStep from './alert_step'
import GenericStep, { RawGenericStep } from './generic_step'
import StepSelector from './step_selector'
import SelectType from './select_type'

const withFormik = (component, initialValues = {}) => (
  <Formik initialValues={initialValues} onSubmit={() => {}}>
    <Form>{component}</Form>
  </Formik>
)

describe('Macro step components', () => {
  it('<WaitStep /> renders duration field', () => {
    const html = renderToStaticMarkup(
      withFormik(
        <WaitStep name='steps[0]' errors={{}} touched={{}} readOnly={false} />,
        { 'steps[0]': { duration: 30 } }
      )
    )
    expect(html).toContain('aria-label="Duration"')
  })

  it('<WaitStep /> renders in readOnly mode', () => {
    const html = renderToStaticMarkup(
      withFormik(
        <WaitStep name='steps[0]' errors={{}} touched={{}} readOnly />,
        { 'steps[0]': { duration: 5 } }
      )
    )
    expect(html).toContain('readOnly=""')
  })

  it('<AlertStep /> renders title and message fields', () => {
    const html = renderToStaticMarkup(
      withFormik(
        <AlertStep name='steps[0]' errors={{}} touched={{}} readOnly={false} />,
        { 'steps[0]': { title: '', message: '' } }
      )
    )
    expect(html).toContain('aria-label="Title"')
    expect(html).toContain('alert.message')
  })

  it('<SelectType /> renders all valid type options', () => {
    const html = renderToStaticMarkup(
      withFormik(
        <SelectType name='steps[0].type' className='custom-select' readOnly={false} />,
        { 'steps[0]': { type: 'wait' } }
      )
    )
    expect((html.match(/<option/g) || [])).toHaveLength(13)
  })

  it('<SelectType /> renders as disabled when readOnly', () => {
    const html = renderToStaticMarkup(
      withFormik(
        <SelectType name='steps[0].type' className='' readOnly />,
        { 'steps[0]': { type: 'wait' } }
      )
    )
    expect(html).toContain('disabled=""')
  })

  it('<StepSelector /> returns null for undefined type', () => {
    const result = StepSelector({ type: undefined, name: 's', errors: {}, touched: {} })
    expect(result).toBeNull()
  })

  it('<StepSelector /> renders WaitStep for wait type', () => {
    const html = renderToStaticMarkup(
      withFormik(
        <StepSelector type='wait' name='steps[0]' errors={{}} touched={{}} />,
        { 'steps[0]': { duration: 10 } }
      )
    )
    expect(html).toContain('aria-label="Duration"')
  })

  it('<StepSelector /> renders AlertStep for alert type', () => {
    const html = renderToStaticMarkup(
      withFormik(
        <StepSelector type='alert' name='steps[0]' errors={{}} touched={{}} />,
        { 'steps[0]': { title: '', message: '' } }
      )
    )
    expect(html).toContain('aria-label="Title"')
  })

  it('<StepSelector /> renders GenericStep for equipment type', () => {
    const result = StepSelector({ type: 'equipment', name: 'steps[0]', errors: {}, touched: {} })
    expect(result.type).toBe(GenericStep)
  })

  it('<GenericStep /> renders select for equipment type', () => {
    const html = renderToStaticMarkup(
      withFormik(
        <RawGenericStep
          type='equipment'
          name='steps[0]'
          errors={{}}
          touched={{}}
          equipment={[{ id: '1', name: 'Return Pump' }]}
        />,
        { 'steps[0]': { id: '1', on: true } }
      )
    )
    expect((html.match(/<select/g) || []).length).toBeGreaterThan(0)
  })
})
