import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import Sidebar from './Sidebar'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const routes = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: <span>D</span> },
  { id: 'equipment', label: 'Equipment', href: '/equipment', icon: <span>E</span> }
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

  it('renders routes, toggles expanded state, persists it, and signs out', () => {
    setMedia(true)
    const onSignOut = jest.fn()
    const onNavigate = jest.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(<Sidebar routes={routes} activeRoute='equipment' onSignOut={onSignOut} onNavigate={onNavigate} />)
    })

    expect(container.querySelector('[aria-label="Main navigation"]')).not.toBeNull()
    expect(container.querySelector('[aria-current="page"]').textContent).toBe('E')

    act(() => container.querySelector('[aria-label="Expand sidebar"]').click())
    expect(localStorage.getItem('reefpi.sidebar-expanded')).toBe('true')
    expect(container.querySelector('[aria-current="page"]').textContent).toContain('Equipment')

    act(() => container.querySelectorAll('a[href="/"]')[1].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })))
    expect(onNavigate).toHaveBeenCalledWith(routes[0])

    act(() => Array.from(container.querySelectorAll('button')).at(-1).click())
    expect(onSignOut).toHaveBeenCalled()

    act(() => root.unmount())
    container.remove()
  })

  it('shows rail tooltip when collapsed and hides it on mouse leave', () => {
    setMedia(true)
    const container = document.createElement('div')
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
})
