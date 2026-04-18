import React from 'react'
import { render } from '@testing-library/react'
import BlankPanel from './blank_panel'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div className='responsive-container'>{children}</div>
}))

describe('<BlankPanel />', () => {
  it('renders without throwing', () => {
    expect(() => render(<BlankPanel height={200} />)).not.toThrow()
  })

  it('renders a container div', () => {
    const { container } = render(<BlankPanel height={200} />)
    expect(container.firstChild.className).toBe('container')
  })

  it('handles componentWillUnmount gracefully', () => {
    const component = render(<BlankPanel height={200} />)
    expect(() => component.unmount()).not.toThrow()
  })
})
