import React from 'react'
import { shallow } from 'enzyme'
import CalibrateForm, { Calibrate } from './calibrate'
import CalibrationWizard from './calibration_wizard'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'


describe('Ph Calibration', () => {
  let values = { enable: true }
  let fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Calibrate />', () => {
    shallow(
      <Calibrate
        values={values}
        errors={{}}
        touched={{}}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
      />
    )
  })

  it('<Calibrate /> should submit', () => {
    const wrapper = shallow(
      <Calibrate
        values={values}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        dirty
        isValid
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
  })

  it('<CalibrateForm/>', () => {
    const wrapper = shallow(<CalibrateForm onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<CalibrationWizard />', () => {
    const fn = jest.fn((id, obj) => {
      return new Promise(resolve => {
        return resolve(true)
      })
    })
    const probe = { id: 1 }
    const wrapper = shallow(<CalibrationWizard
      probe={probe}
      currentReading={[8.7, 9.0, 7.5]}
      cancel={fn}
      confirm={fn}
      calibrateProbe={fn}
    />)
      .instance()

    wrapper.handleCalibrate('mid', 7)
    wrapper.handleCalibrate('second', 10)
    wrapper.handleCalibrate('low', 4)
  })
})
