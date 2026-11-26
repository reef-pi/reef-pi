import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import AddToggle from './add_toggle'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('<AddToggle />', () => {
  const render = props => {
    const container = document.createElement('div')
    const root = createRoot(container)
    act(() => root.render(<AddToggle onClick={jest.fn()} id='add_x' testId='x-toggle' {...props} />))
    return { button: container.querySelector('button'), root }
  }

  it('is a filled primary button with a plus icon while closed', () => {
    const { button, root } = render({ open: false })
    expect(button.id).toBe('add_x')
    expect(button.getAttribute('data-testid')).toBe('x-toggle')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.className).toContain('reefpi-button--primary')
    expect(button.querySelector('svg')).not.toBeNull()
    act(() => root.unmount())
  })

  it('becomes an outline cancel button once open', () => {
    const { button, root } = render({ open: true })
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(button.className).toContain('reefpi-button--secondary')
    expect(button.textContent).toBe('cancel')
    act(() => root.unmount())
  })

  it('calls onClick', () => {
    const onClick = jest.fn()
    const { button, root } = render({ open: false, onClick })
    act(() => button.click())
    expect(onClick).toHaveBeenCalledTimes(1)
    act(() => root.unmount())
  })
})
