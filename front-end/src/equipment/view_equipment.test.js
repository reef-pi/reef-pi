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

  it('renders the legacy switch and edit/delete controls', () => {
    const onStateChange = jest.fn()
    const onEdit = jest.fn()
    const onDelete = jest.fn()
    const { container, root } = renderView({ onStateChange, onEdit, onDelete })

    expect(container.textContent).toContain('Return Pump')
    expect(container.textContent).toContain('Outlet 1')

    act(() => container.querySelector('.switch').click())
    expect(onStateChange).toHaveBeenCalledWith('1', {
      name: 'Return Pump',
      on: true,
      outlet: 'outlet-1',
      stay_off_on_boot: true
    })

    const actionButtons = container.querySelectorAll('.d-inline')
    act(() => actionButtons[0].click())
    act(() => actionButtons[1].click())
    expect(onEdit).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalled()

    act(() => root.unmount())
  })

  it('uses the pending-state toggle path when the feature flag is enabled', async () => {
    window.FEATURE_FLAGS = { pending_states: true }
    const onStateChange = jest.fn()
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }))
    const { container, root } = renderView({ onStateChange })

    await act(async () => {
      container.querySelector('button[role="switch"]').click()
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledWith('/api/equipment/1', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Return Pump',
        on: true,
        outlet: 'outlet-1',
        stay_off_on_boot: true
      })
    }))
    expect(onStateChange).toHaveBeenCalledWith('1', {
      name: 'Return Pump',
      on: true,
      outlet: 'outlet-1',
      stay_off_on_boot: true
    })

    act(() => root.unmount())
  })

  it('keeps pending-state toggle unresolved when the request fails', async () => {
    window.FEATURE_FLAGS = { pending_states: true }
    const onStateChange = jest.fn()
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 403 }))
    const { container, root } = renderView({ onStateChange })

    await act(async () => {
      container.querySelector('button[role="switch"]').click()
      await Promise.resolve()
    })

    expect(onStateChange).not.toHaveBeenCalled()
    expect(container.querySelector('button[role="switch"]').getAttribute('aria-label')).toContain('pending')

    act(() => root.unmount())
  })
})
