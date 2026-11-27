import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import CalibrationModal from './calibration_modal'
import 'isomorphic-fetch'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const RAN = { type: 'DOSING_PUMP_CALIBRATED' }
const SAVED = { type: 'DOSING_PUMP_CALIBRATION_SAVED' }

const dcPump = (regiment = {}) => ({
  id: '1',
  name: 'Pump1',
  type: 'dcpump',
  regiment: { enable: false, speed: 70, duration: 15, volume_per_second: 0, ...regiment }
})

function render (props) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(<CalibrationModal {...props} />))
  return {
    rerender: next => act(() => root.render(<CalibrationModal {...props} {...next} />)),
    cleanup: () => { act(() => root.unmount()); container.remove() }
  }
}

const dialog = () => document.querySelector('[role="dialog"]')
const q = selector => dialog().querySelector(selector)
const flush = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
const setValue = (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  act(() => {
    setter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
const run = async () => {
  await act(async () => { q('[data-testid="doser-calibration-run"]').click() })
  await flush()
}

describe('<CalibrationModal /> (#3303)', () => {
  const makeProps = (overrides = {}) => ({
    doser: dcPump(),
    calibrateDoser: jest.fn().mockResolvedValue(RAN),
    saveCalibration: jest.fn().mockResolvedValue(SAVED),
    onClose: jest.fn(),
    ...overrides
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.clearAllMocks()
  })

  it('asks for speed in % and duration in seconds, and only offers a secondary Close', () => {
    const view = render(makeProps())

    expect(q('input[name="speed"]').value).toBe('70')
    expect(q('input[name="duration"]').value).toBe('15')
    expect(q('[data-unit="speed"]').textContent).toBe('%')
    expect(q('[data-unit="duration"]').textContent).toBe('s')
    const close = q('[data-testid="smoke-doser-calibration-close"]')
    expect(close.className).toContain('reefpi-button--secondary')
    expect(q('[data-calibration-step="measure"]')).toBeNull()
    view.cleanup()
  })

  it('runs the pump with the entered speed and duration and unlocks the measurement once the controller accepts it', async () => {
    let finish
    const calibrateDoser = jest.fn(() => new Promise(resolve => { finish = resolve }))
    const view = render(makeProps({ calibrateDoser }))

    setValue(q('input[name="speed"]'), '50')
    setValue(q('input[name="duration"]'), '20')
    await run()
    expect(calibrateDoser).toHaveBeenCalledWith('1', { speed: 50, duration: 20 })
    expect(q('[data-calibration-step="run"]').dataset.status).toBe('running')
    expect(q('[data-testid="doser-calibration-run"]').disabled).toBe(true)

    await act(async () => { finish(RAN) })
    expect(q('[data-calibration-step="run"]').dataset.status).toBe('started')
    expect(q('[data-calibration-step="measure"]')).not.toBeNull()
    view.cleanup()
  })

  it('keeps a rejected run retryable, says so, and never asks for a measurement', async () => {
    const calibrateDoser = jest.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce(RAN)
    const view = render(makeProps({ calibrateDoser }))

    await run()
    expect(q('[data-calibration-step="run"]').dataset.status).toBe('failed')
    expect(q('.doser-calibration__status--failed[role="alert"]')).not.toBeNull()
    expect(q('[data-calibration-step="measure"]')).toBeNull()
    expect(q('[data-testid="doser-calibration-run"]').disabled).toBe(false)

    await run()
    expect(q('[data-calibration-step="run"]').dataset.status).toBe('started')
    view.cleanup()
  })

  it('does not run with a speed outside 1–100 % or a non-positive duration', async () => {
    const props = makeProps()
    const view = render(props)

    setValue(q('input[name="speed"]'), '150')
    await run()
    setValue(q('input[name="speed"]'), '50')
    setValue(q('input[name="duration"]'), '0')
    await run()
    expect(props.calibrateDoser).not.toHaveBeenCalled()
    view.cleanup()
  })

  it('saves the measured volume in mL against the run that produced it', async () => {
    const props = makeProps()
    const view = render(props)

    await run()
    const volume = q('input[name="measured_volume"]')
    expect(q('[data-unit="measured_volume"]').textContent).toBe('mL')
    setValue(volume, '10.5')
    await act(async () => { q('[data-testid="doser-calibration-save"]').click() })
    await flush()

    expect(props.saveCalibration).toHaveBeenCalledWith('1', { volume: 10.5, duration: 15, speed: 70 })
    expect(q('[data-calibration-step="measure"]').dataset.status).toBe('saved')
    view.cleanup()
  })

  it('keeps the measured volume and explains a failed save', async () => {
    const saveCalibration = jest.fn().mockResolvedValue(undefined)
    const view = render(makeProps({ saveCalibration }))

    await run()
    setValue(q('input[name="measured_volume"]'), '10.5')
    await act(async () => { q('[data-testid="doser-calibration-save"]').click() })
    await flush()

    expect(q('[data-calibration-step="measure"]').dataset.status).toBe('failed')
    expect(q('[data-calibration-step="measure"] [role="alert"]')).not.toBeNull()
    expect(q('input[name="measured_volume"]').value).toBe('10.5')
    view.cleanup()
  })

  it('shows the controller\'s current rate, or that the pump is not calibrated', () => {
    const view = render(makeProps())
    expect(q('.doser-calibration__rate').dataset.calibrated).toBe('false')
    view.rerender({ doser: dcPump({ volume_per_second: 0.7 }) })
    expect(q('.doser-calibration__rate').textContent).toContain('0.700')
    expect(q('.doser-calibration__rate').textContent).toContain('mL/s')
    view.cleanup()
  })

  it('warns, without blocking, when the pump\'s schedule is on', () => {
    const view = render(makeProps({ doser: dcPump({ enable: true }) }))
    expect(q('.doser-calibration__notice')).not.toBeNull()
    expect(q('[data-testid="doser-calibration-run"]').disabled).toBe(false)
    view.rerender({ doser: dcPump({ enable: false }) })
    expect(q('.doser-calibration__notice')).toBeNull()
    view.cleanup()
  })

  it('dispenses a volume in mL on a stepper pump, with no measurement step', async () => {
    const props = makeProps({
      doser: { id: '2', name: 'Stepper', type: 'stepper', regiment: { enable: false, volume: 5 } }
    })
    const view = render(props)

    expect(q('input[name="speed"]')).toBeNull()
    expect(q('[data-unit="volume"]').textContent).toBe('mL')
    await run()
    expect(props.calibrateDoser).toHaveBeenCalledWith('2', { volume: 5 })
    expect(q('[data-calibration-step="run"]').dataset.status).toBe('started')
    expect(q('[data-calibration-step="measure"]')).toBeNull()
    view.cleanup()
  })

  it('closes through the prop', () => {
    const props = makeProps()
    const view = render(props)
    act(() => q('[data-testid="smoke-doser-calibration-close"]').click())
    expect(props.onClose).toHaveBeenCalled()
    view.cleanup()
  })
})
