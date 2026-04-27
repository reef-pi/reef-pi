import React from 'react'
import { shallow } from 'enzyme'
import CalibrationWizard from './calibration_wizard'
import 'isomorphic-fetch'

describe('<CalibrationWizard />', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  const makeProps = (overrides = {}) => ({
    probe: { id: '1', name: 'pH Probe' },
    readProbe: jest.fn(),
    calibrateProbe: jest.fn().mockResolvedValue({}),
    currentReading: { 1: 7.0 },
    cancel: jest.fn(),
    confirm: jest.fn(),
    ...overrides
  })

  it('renders and shows cancel button before mid calibration', () => {
    const wrapper = shallow(<CalibrationWizard {...makeProps()} />)
    expect(wrapper.find('[role="abort"]').length).toBe(1)
    wrapper.instance().componentWillUnmount()
  })

  it('componentDidMount starts polling interval', () => {
    const readProbe = jest.fn()
    const wrapper = shallow(<CalibrationWizard {...makeProps({ readProbe })} />)
    jest.advanceTimersByTime(1500)
    expect(readProbe).toHaveBeenCalledWith('1')
    wrapper.instance().componentWillUnmount()
  })

  it('componentWillUnmount clears interval', () => {
    const readProbe = jest.fn()
    const wrapper = shallow(<CalibrationWizard {...makeProps({ readProbe })} />)
    wrapper.instance().componentWillUnmount()
    jest.advanceTimersByTime(3000)
    expect(readProbe).not.toHaveBeenCalled()
  })

  it('handleCalibrate mid advances state', () => {
    const props = makeProps()
    const wrapper = shallow(<CalibrationWizard {...props} />)
    const inst = wrapper.instance()
    inst.handleCalibrate('mid', 7.0)
    expect(inst.state.enableSecond).toBe(true)
    expect(props.calibrateProbe).toHaveBeenCalledWith('1', { type: 'mid', expected: 7.0, observed: 7.0 })
    inst.componentWillUnmount()
  })

  it('handleCalibrate second advances state', () => {
    const props = makeProps()
    const wrapper = shallow(<CalibrationWizard {...props} />)
    const inst = wrapper.instance()
    inst.handleCalibrate('second', 10.0)
    expect(inst.state.enableLow).toBe(true)
    expect(props.calibrateProbe).toHaveBeenCalledWith('1', { type: 'second', expected: 10.0, observed: 7.0 })
    inst.componentWillUnmount()
  })

  it('handleCalibrate low advances state', () => {
    const props = makeProps()
    const wrapper = shallow(<CalibrationWizard {...props} />)
    const inst = wrapper.instance()
    inst.handleCalibrate('low', 4.0)
    expect(inst.state.lowCalibrated).toBe(true)
    expect(inst.state.enableLow).toBe(false)
    inst.componentWillUnmount()
  })

  it('handleCancel calls props.cancel', () => {
    const props = makeProps()
    const wrapper = shallow(<CalibrationWizard {...props} />)
    wrapper.instance().handleCancel()
    expect(props.cancel).toHaveBeenCalled()
    wrapper.instance().componentWillUnmount()
  })

  it('handleConfirm calls props.confirm', () => {
    const props = makeProps()
    const wrapper = shallow(<CalibrationWizard {...props} />)
    wrapper.instance().handleConfirm()
    expect(props.confirm).toHaveBeenCalled()
    wrapper.instance().componentWillUnmount()
  })

  it('hides cancel button after mid calibrated', () => {
    const props = makeProps()
    const wrapper = shallow(<CalibrationWizard {...props} />)
    wrapper.instance().setState({ midCalibrated: true })
    wrapper.update()
    expect(wrapper.find('[role="abort"]').length).toBe(0)
    wrapper.instance().componentWillUnmount()
  })
})
