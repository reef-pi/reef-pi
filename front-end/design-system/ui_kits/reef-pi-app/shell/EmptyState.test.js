import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import EmptyState, { DoserIcon, EquipmentIcon, LightingIcon, TimerIcon } from './EmptyState'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('design-system EmptyState', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    jest.clearAllMocks()
  })

  it('renders title, optional body, default icon, and action', () => {
    const onClick = jest.fn()
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(
        <EmptyState
          title='No equipment yet'
          body='Add your first pump.'
          action={{ label: 'Add equipment', onClick }}
        />
      )
    })

    expect(container.querySelector('[role="status"]').textContent).toContain('No equipment yet')
    expect(container.textContent).toContain('Add your first pump.')
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBe(null)

    act(() => container.querySelector('button').click())
    expect(onClick).toHaveBeenCalled()

    act(() => root.unmount())
  })

  it('omits optional body and action when they are not supplied', () => {
    const html = renderToStaticMarkup(<EmptyState title='Nothing here' />)

    expect(html).toContain('Nothing here')
    expect(html).not.toContain('<button')
  })

  it('exports route-specific placeholder icons', () => {
    const icons = [EquipmentIcon, TimerIcon, LightingIcon, DoserIcon]

    icons.forEach(Icon => {
      const html = renderToStaticMarkup(<Icon />)
      expect(html).toContain('<svg')
      expect(html).toContain('aria-hidden="true"')
    })
  })
})
