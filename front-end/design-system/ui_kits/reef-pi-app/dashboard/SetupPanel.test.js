import React from 'react'
import { render } from '@testing-library/react'
import SetupPanel from './SetupPanel'

describe('design-system SetupPanel', () => {
  it('renders one heading and one real route link per setup item', () => {
    const { container, getByRole } = render(
      <SetupPanel
        items={[
          { id: 'temperature', title: 'Set up temperature', description: 'Add a probe.', href: '/temperature' },
          { id: 'equipment', title: 'Add equipment', description: 'Connect an outlet.', href: '/equipment' }
        ]}
      />
    )

    expect(container.querySelectorAll('h2')).toHaveLength(1)
    expect(getByRole('link', { name: 'Set up temperature' }).getAttribute('href')).toBe('/temperature')
    expect(getByRole('link', { name: 'Add equipment' }).getAttribute('href')).toBe('/equipment')
    expect(container.querySelectorAll('a')).toHaveLength(2)
    expect(container.textContent).toContain('Add a probe.')
    expect(container.textContent).toContain('Connect an outlet.')
  })

  it('renders nothing when setup is complete', () => {
    const { container } = render(<SetupPanel items={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
