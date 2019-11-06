import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CalibrationModal, { CalibrationForm } from './calibration_modal'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

Enzyme.configure({ adapter: new Adapter() })

describe('Temperature Calibration', () => {
  let values = { enable: true }
  let fn = jest.fn()
  const probe={
    id: 1,
    name: 'probe'
  }
  const currentReading = [ 77, 76 ]


  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<CalibrationModal /> should render form', () => {
    const submitFn = jest.fn()

    const wrapper = shallow(
      <CalibrationModal
        probe={probe}
        currentReading={currentReading}
        defaultValue={77}
        readProbe={fn}
        calibrateProbe={fn}
        cancel={fn}
        onSubmit={submitFn}
      />).dive()

    expect(wrapper.find(CalibrationForm).length).toBe(1)
    wrapper.find(CalibrationForm).dive().find('form').simulate('submit', {})
  })

  it('<CalibrationModal /> should default to 0', () => {
    const submitFn = jest.fn()

    const wrapper = shallow(
      <CalibrationModal
        probe={probe}
        currentReading={currentReading}
        readProbe={fn}
        calibrateProbe={fn}
        cancel={fn}
        onSubmit={submitFn}
      />).dive()

    expect(wrapper.find(CalibrationForm).prop('values').value).toEqual(0)
  })

  it('<CalibrationForm /> should submit', () => {

    const submitFn = jest.fn()

    const wrapper = shallow(
      <CalibrationForm
        values={values}
        probe={probe}
        currentReading={currentReading}
        defaultValue={77}
        readProbe={fn}
        calibrateProbe={fn}
        cancel={fn}
        handleSubmit={submitFn}
      />)

    wrapper.find('form').simulate('submit', {})
    expect(submitFn).toHaveBeenCalled()

  })

  it('<CalibrationForm /> should cancel', () => {

    const cancelFn = jest.fn()

    const wrapper = shallow(
      <CalibrationForm
        values={values}
        probe={probe}
        currentReading={currentReading}
        defaultValue={77}
        readProbe={fn}
        calibrateProbe={fn}
        cancel={cancelFn}
        handleSubmit={fn}
      />)

    wrapper.find('button[role="abort"]').simulate('click', () => {})
    expect(cancelFn).toHaveBeenCalled()
    wrapper.unmount()

  })

  it('<CalibrationForm /> should update readings', () => {

    const readFn = jest.fn()
    jest.useFakeTimers()

    const wrapper = shallow(
      <CalibrationForm
        values={values}
        probe={probe}
        currentReading={currentReading}
        defaultValue={77}
        readProbe={readFn}
        calibrateProbe={fn}
        cancel={fn}
        handleSubmit={fn}
      />)

    jest.runOnlyPendingTimers()
    expect(readFn).toHaveBeenCalled()
    wrapper.unmount()

  })

})
