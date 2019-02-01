import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CalibrateForm, {Calibrate} from './calibrate'
import CalibrationModal from './calibration_modal'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

Enzyme.configure({ adapter: new Adapter() })

describe('Doser Calibration', () => {
  var values = {enable: true}
  var fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showAlert')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Calibrate />', () => {
    shallow(
      <Calibrate values={values}
        errors={{}}
        touched={{}}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn} />
    )
  })

  it('<Calibrate /> should submit', () => {
    const wrapper = shallow(
      <Calibrate values={values}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        dirty
        isValid />
    )
    wrapper.find('form').simulate('submit', {preventDefault: () => {}})
  })

  it('<CalibrateForm/>', () => {
    const wrapper = shallow(<CalibrateForm onSubmit={fn} duration="15" speed="100"/>)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<CalibrationWizard />', () => {
    const fn = jest.fn((duration, speed) => {
      return new Promise(resolve => {
        return resolve(true)
      })
    })
    const doser = {id: 1, regiment: {speed: 100, duration: 15}}
    const wrapper = shallow(<CalibrationModal doser={doser} calibrateDoser={fn} />)
      .instance()

    wrapper.cancel()
    wrapper.confirm()
    wrapper.calibrate(20, 50)
  })
})
