import React from 'react'
import CalibrationWizard from './calibration_wizard'
import 'isomorphic-fetch'

const findAll = (node, predicate, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (predicate(node)) {
    acc.push(node)
  }
  React.Children.toArray(node.props?.children).forEach(child => findAll(child, predicate, acc))
  return acc
}

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
    const component = new CalibrationWizard(makeProps())
    const tree = component.render()
    expect(findAll(tree, node => node.props?.role === 'abort')).toHaveLength(1)
    component.componentWillUnmount()
  })

  it('componentDidMount starts polling interval', () => {
    const readProbe = jest.fn()
    const wrapper = new CalibrationWizard(makeProps({ readProbe }))
    wrapper.componentDidMount()
    jest.advanceTimersByTime(1500)
    expect(readProbe).toHaveBeenCalledWith('1')
    wrapper.componentWillUnmount()
  })

  it('componentWillUnmount clears interval', () => {
    const readProbe = jest.fn()
    const wrapper = new CalibrationWizard(makeProps({ readProbe }))
    wrapper.componentDidMount()
    wrapper.componentWillUnmount()
    jest.advanceTimersByTime(3000)
    expect(readProbe).not.toHaveBeenCalled()
  })

  it('handleCalibrate mid advances state', () => {
    const props = makeProps()
    const inst = new CalibrationWizard(props)
    inst.setState = update => { inst.state = { ...inst.state, ...(typeof update === 'function' ? update(inst.state) : update) } }
    inst.handleCalibrate('mid', 7.0)
    expect(inst.state.enableSecond).toBe(true)
    expect(props.calibrateProbe).toHaveBeenCalledWith('1', { type: 'mid', expected: 7.0, observed: 7.0 })
    inst.componentWillUnmount()
  })

  it('handleCalibrate second advances state', () => {
    const props = makeProps()
    const inst = new CalibrationWizard(props)
    inst.setState = update => { inst.state = { ...inst.state, ...(typeof update === 'function' ? update(inst.state) : update) } }
    inst.handleCalibrate('second', 10.0)
    expect(inst.state.enableLow).toBe(true)
    expect(props.calibrateProbe).toHaveBeenCalledWith('1', { type: 'second', expected: 10.0, observed: 7.0 })
    inst.componentWillUnmount()
  })

  it('handleCalibrate low advances state', () => {
    const props = makeProps()
    const inst = new CalibrationWizard(props)
    inst.setState = update => { inst.state = { ...inst.state, ...(typeof update === 'function' ? update(inst.state) : update) } }
    inst.handleCalibrate('low', 4.0)
    expect(inst.state.lowCalibrated).toBe(true)
    expect(inst.state.enableLow).toBe(false)
    inst.componentWillUnmount()
  })

  it('handleCancel calls props.cancel', () => {
    const props = makeProps()
    const wrapper = new CalibrationWizard(props)
    wrapper.handleCancel()
    expect(props.cancel).toHaveBeenCalled()
    wrapper.componentWillUnmount()
  })

  it('handleConfirm calls props.confirm', () => {
    const props = makeProps()
    const wrapper = new CalibrationWizard(props)
    wrapper.handleConfirm()
    expect(props.confirm).toHaveBeenCalled()
    wrapper.componentWillUnmount()
  })

  it('hides cancel button after mid calibrated', () => {
    const props = makeProps()
    const wrapper = new CalibrationWizard(props)
    wrapper.setState = update => { wrapper.state = { ...wrapper.state, ...(typeof update === 'function' ? update(wrapper.state) : update) } }
    wrapper.setState({ midCalibrated: true })
    const tree = wrapper.render()
    expect(findAll(tree, node => node.props?.role === 'abort')).toHaveLength(0)
    wrapper.componentWillUnmount()
  })
})
