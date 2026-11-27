import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Formik, Form } from 'formik'
import EditDcPump from './edit_dcpump'
import EditStepper from './edit_stepper'
import 'isomorphic-fetch'


const wrapFormik = (component, initialValues = {}) => (
  <Formik initialValues={initialValues} onSubmit={() => {}}>
    <Form>{component}</Form>
  </Formik>
)

const renderMarkup = (component, initialValues = {}) =>
  renderToStaticMarkup(wrapFormik(component, initialValues))

const jacks = [{ id: '1', name: 'Jack 1', pins: [1, 2, 3] }]
const outlets = [{ id: '1', name: 'Outlet A' }, { id: '2', name: 'Outlet B' }]

describe('Doser pump components', () => {
  it('<EditDcPump /> renders with jacks', () => {
    const html = renderMarkup(
      <EditDcPump
        values={{ jack: '', pin: '', enable: true, continuous: false, volume_per_second: 0, duration: 10, speed: 100, soft_start: 0 }}
        errors={{}}
        touched={{}}
        jacks={jacks}
        readOnly={false}
        handleChange={jest.fn()}
        setFieldValue={jest.fn()}
        onBlur={jest.fn()}
      />
    )
    expect(html).toContain('smoke-doser-jack')
    expect(html).toContain('Jack 1')
  })

  it('<EditDcPump /> shows volume field when volume_per_second > 0', () => {
    const html = renderMarkup(
      <EditDcPump
        values={{ jack: '1', pin: 1, enable: true, continuous: false, volume_per_second: 1.5, volume: 50, speed: 100, soft_start: 0 }}
        errors={{}}
        touched={{}}
        jacks={jacks}
        readOnly={false}
        handleChange={jest.fn()}
        setFieldValue={jest.fn()}
        onBlur={jest.fn()}
      />
    )
    expect(html).toContain('name="volume"')
    expect(html).toContain('1.500 mL/s')
  })

  it('<EditDcPump /> hides volume/duration when continuous', () => {
    const html = renderMarkup(
      <EditDcPump
        values={{ jack: '1', pin: 1, enable: true, continuous: true, volume_per_second: 0, speed: 100, soft_start: 0 }}
        errors={{}}
        touched={{}}
        jacks={jacks}
        readOnly={false}
        handleChange={jest.fn()}
        setFieldValue={jest.fn()}
        onBlur={jest.fn()}
      />
    )
    expect(html).not.toContain('smoke-doser-duration')
  })

  it('<EditDcPump /> readOnly', () => {
    const html = renderMarkup(
      <EditDcPump
        values={{ jack: '', pin: '', enable: true, continuous: false, volume_per_second: 0, duration: 10, speed: 100, soft_start: 0 }}
        errors={{}}
        touched={{}}
        jacks={[]}
        readOnly
        handleChange={jest.fn()}
        setFieldValue={jest.fn()}
        onBlur={jest.fn()}
      />
    )
    expect(html).toContain('smoke-doser-jack')
    expect(html).toContain('disabled=""')
  })

  it('<EditStepper /> renders with outlets', () => {
    const html = renderMarkup(
      <EditStepper
        values={{ stepper: { step_pin: '', direction_pin: '', ms_pin_a: '', ms_pin_b: '', ms_pin_c: '', spr: 200, vpr: 0, delay: 0, direction: true, microstepping: 'Full' } }}
        errors={{}}
        touched={{}}
        outlets={outlets}
        readOnly={false}
        handleChange={jest.fn()}
        setFieldValue={jest.fn()}
        onBlur={jest.fn()}
      />
    )
    expect(html).toContain('Outlet A')
    expect(html).toContain('stepper.step_pin')
  })

  it('<EditStepper /> readOnly', () => {
    const html = renderMarkup(
      <EditStepper
        values={{ stepper: { step_pin: '1', direction_pin: '', ms_pin_a: '', ms_pin_b: '', ms_pin_c: '', spr: 200, vpr: 0, delay: 0, direction: true, microstepping: 'Full' } }}
        errors={{}}
        touched={{}}
        outlets={outlets}
        readOnly
        handleChange={jest.fn()}
        setFieldValue={jest.fn()}
        onBlur={jest.fn()}
      />
    )
    expect(html).toContain('stepper.step_pin')
    expect(html).toContain('disabled=""')
  })
})
