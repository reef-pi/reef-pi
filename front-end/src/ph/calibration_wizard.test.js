import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import CalibrationWizard from './calibration_wizard'
import 'isomorphic-fetch'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const STORED = { type: 'PH_PROBE_CALIBRATED' }

function render (props) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(<CalibrationWizard {...props} />))
  return {
    rerender: next => act(() => root.render(<CalibrationWizard {...props} {...next} />)),
    cleanup: () => { act(() => root.unmount()); container.remove() }
  }
}

const dialog = () => document.querySelector('[role="dialog"]')
const step = point => document.querySelector(`[data-calibration-step="${point}"]`)
const runButton = point => step(point).querySelector('button[type="submit"]')
const flush = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })

describe('<CalibrationWizard />', () => {
  const makeProps = (overrides = {}) => ({
    probe: { id: '1', name: 'Tank pH' },
    readProbe: jest.fn(),
    calibrateProbe: jest.fn().mockResolvedValue(STORED),
    currentReading: { 1: 7.023 },
    cancel: jest.fn(),
    confirm: jest.fn(),
    ...overrides
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('lists the three points in order: midpoint first, the others after it', () => {
    const view = render(makeProps())

    expect([...document.querySelectorAll('[data-calibration-step]')].map(node => node.dataset.calibrationStep)).toEqual(['mid', 'second', 'low'])
    expect(step('mid').dataset.status).toBe('ready')
    expect(step('second').dataset.status).toBe('locked')
    expect(step('low').dataset.status).toBe('locked')
    expect(runButton('second').disabled).toBe(true)
    expect(dialog().querySelector('[role="abort"]')).not.toBeNull()
    view.cleanup()
  })

  it('shows the live reading with its unit', () => {
    const view = render(makeProps())
    expect(document.querySelector('.ph-calibration-reading').textContent).toContain('7.02')
    expect(document.querySelector('.ph-calibration-reading').textContent).toContain('pH')
    view.cleanup()
  })

  it('waits for a reading before a point can be stored, and never invents one', () => {
    const view = render(makeProps({ currentReading: {} }))

    expect(document.querySelector('.ph-calibration-reading__waiting')).not.toBeNull()
    expect(document.querySelector('.ph-calibration-reading__value')).toBeNull()
    expect(runButton('mid').disabled).toBe(true)
    view.cleanup()
  })

  it('stores a point only when the controller confirms it, then unlocks the next one', async () => {
    let finish
    const calibrateProbe = jest.fn(() => new Promise(resolve => { finish = resolve }))
    const view = render(makeProps({ calibrateProbe }))

    await act(async () => { runButton('mid').click() })
    await flush()
    expect(calibrateProbe).toHaveBeenCalledWith('1', { type: 'mid', expected: 7, observed: 7.023 })
    expect(step('mid').dataset.status).toBe('storing')
    expect(step('second').dataset.status).toBe('locked')

    await act(async () => { finish(STORED) })
    expect(step('mid').dataset.status).toBe('stored')
    expect(step('second').dataset.status).toBe('ready')
    // Once a point is stored, closing is "Done": stopping here is the supported skip.
    expect(dialog().querySelector('[role="abort"]')).toBeNull()
    view.cleanup()
  })

  it('keeps a failed point retryable and explains the failure', async () => {
    const calibrateProbe = jest.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce(STORED)
    const view = render(makeProps({ calibrateProbe }))

    await act(async () => { runButton('mid').click() })
    await flush()
    expect(step('mid').dataset.status).toBe('failed')
    expect(step('mid').querySelector('.ph-calibration-step__status--failed[role="alert"]')).not.toBeNull()
    expect(step('second').dataset.status).toBe('locked')
    expect(runButton('mid').disabled).toBe(false)

    await act(async () => { runButton('mid').click() })
    await flush()
    expect(step('mid').dataset.status).toBe('stored')
    view.cleanup()
  })

  it('polls the probe while open and stops when closed', () => {
    jest.useFakeTimers()
    const readProbe = jest.fn()
    const view = render(makeProps({ readProbe }))
    act(() => { jest.advanceTimersByTime(1500) })
    expect(readProbe).toHaveBeenCalledWith('1')
    view.cleanup()
    readProbe.mockClear()
    act(() => { jest.advanceTimersByTime(3000) })
    expect(readProbe).not.toHaveBeenCalled()
  })

  it('cancels and confirms through the props', () => {
    const props = makeProps()
    const view = render(props)
    act(() => dialog().querySelector('[role="abort"]').click())
    expect(props.cancel).toHaveBeenCalled()
    act(() => dialog().querySelector('[role="confirm"]').click())
    expect(props.confirm).toHaveBeenCalled()
    view.cleanup()
  })
})
