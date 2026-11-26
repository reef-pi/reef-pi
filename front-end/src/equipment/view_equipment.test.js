import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import ViewEquipment from './view_equipment'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const equipment = {
  id: '1',
  name: 'Return Pump',
  on: false,
  outlet: 'outlet-1',
  stay_off_on_boot: true
}

const renderView = props => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(
      <ViewEquipment
        equipment={equipment}
        outletName='Outlet 1'
        onStateChange={jest.fn()}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
        {...props}
      />
    )
  })
  return { container, root }
}

describe('<ViewEquipment />', () => {
  beforeEach(() => {
    window.FEATURE_FLAGS = {}
  })

  afterEach(() => {
    document.body.innerHTML = ''
    delete window.FEATURE_FLAGS
    delete global.fetch
    jest.clearAllMocks()
  })

  it('renders equipment name, outlet, and edit/delete actions in one overflow menu', () => {
    const onEdit = jest.fn()
    const onDelete = jest.fn()
    const { container, root } = renderView({ onEdit, onDelete })

    expect(container.textContent).toContain('Return Pump')
    expect(container.textContent).toContain('Outlet 1')

    const trigger = container.querySelector('[aria-label="Equipment actions"]')
    expect(trigger).toBeTruthy()

    act(() => trigger.click())
    act(() => Array.from(container.querySelectorAll('[role="menuitem"]')).find(item => item.textContent === 'Edit').click())
    expect(onEdit).toHaveBeenCalled()
    expect(document.activeElement).toBe(trigger)

    act(() => trigger.click())
    act(() => Array.from(container.querySelectorAll('[role="menuitem"]')).find(item => item.textContent === 'Delete').click())
    expect(onDelete).toHaveBeenCalled()
    expect(document.activeElement).toBe(trigger)

    act(() => root.unmount())
  })

  it.each([
    [true, 'Commanded on'],
    [false, 'Commanded off']
  ])('describes idle command state without claiming the equipment is running', (on, label) => {
    const { container, root } = renderView({ equipment: { ...equipment, on } })

    expect(container.querySelector('[role="status"]').textContent).toBe(label)
    expect(container.textContent.toLowerCase()).not.toContain('running')

    act(() => root.unmount())
  })

  it('describes a missing equipment state as unknown', () => {
    const { on, ...withoutState } = equipment
    const { container, root } = renderView({ equipment: withoutState })

    expect(container.querySelector('[role="status"]').textContent).toBe('Command state unknown')

    act(() => root.unmount())
  })

  it('fires onStateChange via the pending-state toggle on success', async () => {
    const onStateChange = jest.fn()
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }))
    const { container, root } = renderView({ onStateChange })

    await act(async () => {
      container.querySelector('button[role="switch"]').click()
      await Promise.resolve()
    })

    // Only the control endpoint changes the outlet state; the update endpoint ignores `on`.
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('/api/equipment/1/control', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ on: true })
    }))
    expect(onStateChange).toHaveBeenCalledWith('1', { on: true })

    act(() => root.unmount())
  })

  it('announces a pending command while the request is unresolved', async () => {
    global.fetch = jest.fn(() => new Promise(() => {}))
    const { container, root } = renderView()

    await act(async () => {
      container.querySelector('button[role="switch"]').click()
      await Promise.resolve()
    })

    expect(container.querySelector('[role="status"]').textContent).toBe('Command pending')
    expect(container.querySelector('button[role="switch"]').disabled).toBe(true)

    act(() => root.unmount())
  })

  it('announces failure and lets the switch retry the command', async () => {
    jest.useFakeTimers()
    const onStateChange = jest.fn()
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 403 }))
    const { container, root } = renderView({ onStateChange })

    await act(async () => {
      container.querySelector('button[role="switch"]').click()
      await Promise.resolve()
    })

    for (const delay of [500, 1000, 2000]) {
      await act(async () => {
        jest.advanceTimersByTime(delay)
        await Promise.resolve()
      })
    }

    expect(onStateChange).not.toHaveBeenCalled()
    expect(container.querySelector('[role="status"]').textContent).toBe('Command failed')
    expect(container.querySelector('button[role="switch"]').getAttribute('aria-label')).toContain('error')

    await act(async () => {
      container.querySelector('button[role="switch"]').click()
      await Promise.resolve()
    })
    expect(container.querySelector('[role="status"]').textContent).toBe('Command pending')
    expect(global.fetch).toHaveBeenCalledTimes(5)

    act(() => root.unmount())
    jest.useRealTimers()
  })
})
