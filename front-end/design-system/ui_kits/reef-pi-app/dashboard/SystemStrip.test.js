import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import SystemStrip from './SystemStrip'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('design-system SystemStrip', () => {
  it('renders ok health without alerts', () => {
    const html = renderToStaticMarkup(
      <SystemStrip displayName='Reef A' uptimeLabel='3d' version='6.0' alerts={[]} />
    )

    expect(html).toContain('System health: ok')
    expect(html).toContain('Reef A')
    expect(html).toContain('3d')
    expect(html).toContain('6.0')
  })

  it('renders warning and critical alert badges', () => {
    expect(renderToStaticMarkup(
      <SystemStrip alerts={[{ severity: 'warn' }]} />
    )).toContain('1 alert')

    expect(renderToStaticMarkup(
      <SystemStrip alerts={[{ severity: 'warn' }, { severity: 'critical' }]} />
    )).toContain('System health: critical')
  })

  it('opens menu, invokes actions, and closes on outside pointer down', () => {
    const onAlertClick = jest.fn()
    const onConfigure = jest.fn()
    const onSignOut = jest.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <SystemStrip
          alerts={[{ severity: 'warn' }]}
          onAlertClick={onAlertClick}
          onConfigure={onConfigure}
          onSignOut={onSignOut}
        />
      )
    })

    const alertButton = container.querySelector('button[aria-label="1 alert — open alert center"]')
    act(() => alertButton.click())
    expect(onAlertClick).toHaveBeenCalled()

    const menuButton = container.querySelector('button[aria-label="System menu"]')
    act(() => menuButton.click())
    expect(container.querySelector('[role="menu"]')).not.toBeNull()

    act(() => container.querySelectorAll('[role="menuitem"]')[0].click())
    expect(onConfigure).toHaveBeenCalled()
    expect(container.querySelector('[role="menu"]')).toBeNull()

    act(() => menuButton.click())
    act(() => container.querySelectorAll('[role="menuitem"]')[1].click())
    expect(onSignOut).toHaveBeenCalled()

    act(() => menuButton.click())
    expect(container.querySelector('[role="menu"]')).not.toBeNull()
    act(() => document.dispatchEvent(new Event('pointerdown', { bubbles: true })))
    expect(container.querySelector('[role="menu"]')).toBeNull()

    act(() => root.unmount())
    container.remove()
  })
})
