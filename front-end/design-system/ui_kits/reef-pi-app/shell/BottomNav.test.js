import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import BottomNav from './BottomNav'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const routes = [
  { id: 'dashboard', label: 'Dashboard', icon: <span>D</span> },
  { id: 'equipment', label: 'Equipment', icon: <span>E</span> },
  { id: 'lighting', label: 'Lighting', icon: <span>L</span> },
  { id: 'temperature', label: 'Temp', icon: <span>T</span> },
  { id: 'ato', label: 'ATO', icon: <span>A</span> },
  { id: 'ph', label: 'pH', icon: <span>P</span> }
]

const setWidth = width => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
}

describe('design-system BottomNav', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing at desktop width', () => {
    setWidth(1200)
    expect(renderToStaticMarkup(<BottomNav primaryRoutes={routes} allRoutes={routes} />)).toBe('')
  })

  it('renders mobile tabs, opens drawer, navigates, signs out, and closes on escape', () => {
    setWidth(480)
    const onNavigate = jest.fn()
    const onSignOut = jest.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <BottomNav
          primaryRoutes={routes}
          allRoutes={routes}
          activeRoute='equipment'
          onNavigate={onNavigate}
          onSignOut={onSignOut}
        />
      )
    })

    expect(container.querySelector('[aria-label="Main navigation"]')).not.toBeNull()
    expect(container.querySelector('[aria-current="page"]').getAttribute('aria-label')).toBe('Equipment')

    act(() => container.querySelector('[aria-label="Dashboard"]').click())
    expect(onNavigate).toHaveBeenCalledWith(routes[0])

    act(() => container.querySelector('[aria-label="More routes"]').click())
    expect(container.querySelector('[aria-label="Navigation drawer"]')).not.toBeNull()

    act(() => Array.from(container.querySelectorAll('button')).find(button => button.textContent.includes('pH')).click())
    expect(onNavigate).toHaveBeenCalledWith(routes[5])
    expect(container.querySelector('[aria-label="Navigation drawer"]')).toBeNull()

    act(() => container.querySelector('[aria-label="More routes"]').click())
    act(() => Array.from(container.querySelectorAll('button')).find(button => button.textContent.includes('Sign out')).click())
    expect(onSignOut).toHaveBeenCalled()

    act(() => container.querySelector('[aria-label="More routes"]').click())
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })))
    expect(container.querySelector('[aria-label="Navigation drawer"]')).toBeNull()

    act(() => root.unmount())
    container.remove()
  })

  it('renders tablet hamburger and closes drawer from backdrop and close button', () => {
    setWidth(800)
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<BottomNav primaryRoutes={routes} allRoutes={routes} />)
    })

    const hamburger = container.querySelector('[aria-label="Open navigation"]')
    expect(hamburger).not.toBeNull()
    act(() => hamburger.click())
    expect(container.querySelector('[aria-label="Navigation drawer"]')).not.toBeNull()

    act(() => container.querySelector('[aria-label="Close navigation"]').click())
    expect(container.querySelector('[aria-label="Navigation drawer"]')).toBeNull()

    act(() => hamburger.click())
    act(() => container.querySelector('div[aria-hidden="true"]').click())
    expect(container.querySelector('[aria-label="Navigation drawer"]')).toBeNull()

    act(() => root.unmount())
  })
})
