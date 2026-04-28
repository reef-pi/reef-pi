import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Formik, Form } from 'formik'
import EditDcPump from './edit_dcpump'
import EditStepper from './edit_stepper'
import CalibrationModal from './calibration_modal'
import 'isomorphic-fetch'

jest.mock('jquery', () => ({
  Deferred: jest.fn().mockReturnValue({ resolve: jest.fn(), reject: jest.fn() })
}))

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

  it('<CalibrationModal /> renders for DC pump', () => {
    const doser = {
      id: '1',
      name: 'Doser 1',
      type: 'dcpump',
      regiment: { duration: 10, speed: 100, volume: 0, volume_per_second: 0.5 }
    }
    const instance = new CalibrationModal({
      doser,
      calibrateDoser: jest.fn(),
      saveCalibration: jest.fn(),
      cancel: jest.fn(),
      confirm: jest.fn()
    })

    expect(React.isValidElement(instance.render())).toBe(true)
  })

  it('<CalibrationModal /> handleCalibrate for DC pump', () => {
    const calibrateDoser = jest.fn()
    const doser = {
      id: '1',
      name: 'Doser 1',
      type: 'dcpump',
      regiment: { duration: 10, speed: 100, volume: 0, volume_per_second: 0 }
    }
    const inst = new CalibrationModal({ doser, calibrateDoser, saveCalibration: jest.fn(), cancel: jest.fn(), confirm: jest.fn() })
    inst.state = { lastDuration: 10, lastSpeed: 100, ranCalibration: false, measuredVolume: '' }
    inst.setState = update => { inst.state = { ...inst.state, ...(typeof update === 'function' ? update(inst.state) : update) } }
    inst.handleCalibrate(5, 80, 0)
    expect(calibrateDoser).toHaveBeenCalledWith('1', { duration: 5, speed: 80 })
    expect(inst.state.ranCalibration).toBe(true)
  })

  it('<CalibrationModal /> handleCalibrate for stepper', () => {
    const calibrateDoser = jest.fn()
    const doser = {
      id: '2',
      name: 'Stepper 1',
      type: 'stepper',
      regiment: { duration: 0, speed: 0, volume: 10, volume_per_second: 0 }
    }
    const inst = new CalibrationModal({ doser, calibrateDoser, saveCalibration: jest.fn(), cancel: jest.fn(), confirm: jest.fn() })
    inst.state = { lastDuration: 0, lastSpeed: 0, ranCalibration: false, measuredVolume: '' }
    inst.setState = update => { inst.state = { ...inst.state, ...(typeof update === 'function' ? update(inst.state) : update) } }
    inst.handleCalibrate(0, 0, 25.0)
    expect(calibrateDoser).toHaveBeenCalledWith('2', { volume: 25.0 })
  })

  it('<CalibrationModal /> handleSaveCalibration skips invalid volume', () => {
    const saveCalibration = jest.fn()
    const doser = { id: '1', name: 'D', type: 'dcpump', regiment: { duration: 10, speed: 100, volume: 0, volume_per_second: 0 } }
    const inst = new CalibrationModal({ doser, calibrateDoser: jest.fn(), saveCalibration, cancel: jest.fn(), confirm: jest.fn() })
    inst.state = { lastDuration: 10, lastSpeed: 100, ranCalibration: true, measuredVolume: '' }
    inst.setState = update => { inst.state = { ...inst.state, ...(typeof update === 'function' ? update(inst.state) : update) } }
    inst.handleSaveCalibration()
    expect(saveCalibration).not.toHaveBeenCalled()
  })

  it('<CalibrationModal /> handleSaveCalibration with valid volume', () => {
    const saveCalibration = jest.fn()
    const doser = { id: '1', name: 'D', type: 'dcpump', regiment: { duration: 10, speed: 100, volume: 0, volume_per_second: 0 } }
    const inst = new CalibrationModal({ doser, calibrateDoser: jest.fn(), saveCalibration, cancel: jest.fn(), confirm: jest.fn() })
    inst.state = { lastDuration: 10, lastSpeed: 100, ranCalibration: true, measuredVolume: '25.5' }
    inst.setState = update => { inst.state = { ...inst.state, ...(typeof update === 'function' ? update(inst.state) : update) } }
    inst.handleSaveCalibration()
    expect(saveCalibration).toHaveBeenCalledWith('1', { volume: 25.5, duration: 10, speed: 100 })
    expect(inst.state.ranCalibration).toBe(false)
  })
})
