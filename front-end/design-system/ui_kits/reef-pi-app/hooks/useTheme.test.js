import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { FIRST_PAINT_SCRIPT, useTheme } from './useTheme'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const ThemeProbe = ({ onUpdate }) => {
  const theme = useTheme()
  onUpdate(theme)
  return <button onClick={() => theme.setTheme('dark')}>{theme.resolvedTheme}</button>
}

const mockMatchMedia = matches => {
  const listeners = []
  window.matchMedia = jest.fn(() => ({
    matches,
    addEventListener: (event, listener) => listeners.push(listener),
    removeEventListener: jest.fn()
  }))
  return listeners
}

describe('design-system useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.clearAllMocks()
  })

  it('applies system preference, dispatches theme-change, and updates theme', () => {
    const listeners = mockMatchMedia(true)
    const changes = []
    document.documentElement.addEventListener('reefpi:theme-change', e => changes.push(e.detail.theme))
    const updates = []
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<ThemeProbe onUpdate={theme => updates.push(theme)} />)
    })

    expect(updates.at(-1).theme).toBe('system')
    expect(updates.at(-1).resolvedTheme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    act(() => listeners[0]())
    expect(changes).toContain('dark')

    act(() => container.querySelector('button').click())
    expect(localStorage.getItem('reefpi.theme')).toBe('dark')
    expect(updates.at(-1).theme).toBe('dark')

    act(() => updates.at(-1).setTheme('bogus'))
    expect(localStorage.getItem('reefpi.theme')).toBe('dark')

    act(() => updates.at(-1).setTheme('light'))
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)

    act(() => root.unmount())
  })

  it('initializes from persisted theme and exposes first paint script', () => {
    mockMatchMedia(false)
    localStorage.setItem('reefpi.theme', 'actinic')
    const updates = []
    const root = createRoot(document.createElement('div'))

    act(() => {
      root.render(<ThemeProbe onUpdate={theme => updates.push(theme)} />)
    })

    expect(updates.at(-1).theme).toBe('actinic')
    expect(updates.at(-1).resolvedTheme).toBe('actinic')
    expect(document.documentElement.getAttribute('data-theme')).toBe('actinic')
    expect(FIRST_PAINT_SCRIPT).toContain('reefpi.theme')

    act(() => root.unmount())
  })
})
