import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import ThemePicker from './ThemePicker'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const mockMatchMedia = matches => {
  window.matchMedia = jest.fn(() => ({
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
}

describe('design-system ThemePicker', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    mockMatchMedia(false)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.clearAllMocks()
  })

  it('renders all theme options and marks the current theme active', () => {
    localStorage.setItem('reefpi.theme', 'actinic')
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<ThemePicker />)
    })

    expect(container.querySelector('legend').textContent).toBe('Appearance')
    expect([...container.querySelectorAll('input[name="reefpi-theme"]')].map(input => input.value))
      .toEqual(['system', 'light', 'dark', 'actinic'])
    expect(container.querySelector('input[value="actinic"]').checked).toBe(true)
    expect(container.textContent).toContain('active')

    act(() => root.unmount())
  })

  it('updates theme and reports session overrides', () => {
    const onSessionOverride = jest.fn()
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<ThemePicker onSessionOverride={onSessionOverride} />)
    })

    act(() => {
      container.querySelector('input[value="dark"]').click()
    })

    expect(localStorage.getItem('reefpi.theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(onSessionOverride).toHaveBeenCalledWith('dark')
    expect(container.querySelector('input[value="dark"]').checked).toBe(true)

    act(() => root.unmount())
  })
})
