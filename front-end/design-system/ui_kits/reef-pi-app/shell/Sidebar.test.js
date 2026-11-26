import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import Sidebar from './Sidebar'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const routes = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: <span>D</span>, group: 'observe' },
  { id: 'equipment', label: 'Equipment', href: '/equipment', icon: <span>E</span>, group: 'operate' },
  { id: 'extra', label: 'Extra', href: '/extra', icon: <span>X</span> }
]

const setMedia = matches => {
  const listeners = []
  window.matchMedia = jest.fn(() => ({
    matches,
    addEventListener: (event, listener) => listeners.push(listener),
    removeEventListener: jest.fn()
  }))
  return listeners
}

describe('design-system Sidebar', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.clearAllMocks()
  })

  it('renders nothing below desktop breakpoint', () => {
    setMedia(false)
    const container = document.createElement('div')
    const root = createRoot(container)
    act(() => root.render(<Sidebar routes={routes} />))
    expect(container.innerHTML).toBe('')
    act(() => root.unmount())
  })

  it('opens expanded with labelled groups, collapses to an accessible rail, persists it, and signs out', () => {
    setMedia(true)
    const onSignOut = jest.fn()
    const onNavigate = jest.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(<Sidebar routes={routes} activeRoute='equipment' onSignOut={onSignOut} onNavigate={onNavigate} footer={expanded => <p data-testid='footer'>{expanded ? 'full' : 'compact'}</p>} />)
    })

    expect(container.querySelector('[aria-label="Main navigation"]')).not.toBeNull()
    // Expanded by default: group headings, then routes with visible labels; ungrouped routes go last.
    expect([...container.querySelectorAll('[role="group"]')].map(group => group.getAttribute('aria-label'))).toEqual(['Observe', 'Operate', null])
    expect(container.querySelector('[aria-current="page"]').textContent).toBe('EEquipment')
    expect(container.querySelector('[data-testid="footer"]').textContent).toBe('full')
    expect(document.documentElement.style.getPropertyValue('--reefpi-sidebar-width')).toBe('var(--reefpi-sidebar-expanded)')

    act(() => container.querySelector('[aria-label="Collapse sidebar"]').click())
    expect(localStorage.getItem('reefpi.sidebar-expanded')).toBe('false')
    // The rail keeps each route's name for assistive technology.
    expect(container.querySelector('[aria-current="page"]').getAttribute('aria-label')).toBe('Equipment')
    expect(container.querySelector('[data-testid="footer"]').textContent).toBe('compact')
    expect(document.documentElement.style.getPropertyValue('--reefpi-sidebar-width')).toBe('var(--reefpi-sidebar-rail)')

    act(() => container.querySelector('a[href="/"][data-testid="smoke-tab-dashboard"]').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })))
    expect(onNavigate).toHaveBeenCalledWith(routes[0])

    act(() => container.querySelector('[data-testid="smoke-sign-out"]').click())
    expect(onSignOut).toHaveBeenCalled()

    act(() => root.unmount())
    container.remove()
  })

  it('shows rail tooltip when collapsed and hides it on mouse leave', () => {
    setMedia(true)
    localStorage.setItem('reefpi.sidebar-expanded', 'false')
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(<Sidebar routes={routes} activeRoute='dashboard' />)
    })

    const route = container.querySelector('a[href="/equipment"]')
    route.getBoundingClientRect = () => ({ top: 42 })
    act(() => route.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })))
    expect(container.querySelector('[role="tooltip"]').textContent).toBe('Equipment')

    act(() => route.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })))
    expect(container.querySelector('[role="tooltip"]')).toBeNull()

    act(() => root.unmount())
  })

  it('shows the collapsed route label when its link receives keyboard focus', () => {
    setMedia(true)
    localStorage.setItem('reefpi.sidebar-expanded', 'false')
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => root.render(<Sidebar routes={routes} activeRoute='dashboard' />))

    const route = container.querySelector('a[href="/equipment"]')
    act(() => route.focus())
    expect(container.querySelector('[role="tooltip"]')?.textContent).toBe('Equipment')

    act(() => route.blur())
    expect(container.querySelector('[role="tooltip"]')).toBeNull()

    act(() => root.unmount())
    container.remove()
  })
})
