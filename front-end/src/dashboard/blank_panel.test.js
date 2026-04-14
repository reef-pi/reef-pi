import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import BlankPanel from './blank_panel'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div className='responsive-container'>{children}</div>
}))

describe('<BlankPanel />', () => {
  it('renders without throwing', () => {
    expect(() => renderToStaticMarkup(<BlankPanel height={200} />)).not.toThrow()
  })

  it('renders a container div', () => {
    const html = renderToStaticMarkup(<BlankPanel height={200} />)
    expect(html).toContain('class="container"')
  })

  it('handles componentWillUnmount gracefully', () => {
    const panel = new BlankPanel({ height: 200 })
    panel.setState = jest.fn()
    expect(() => panel.componentWillUnmount()).not.toThrow()
    expect(panel.setState).toHaveBeenCalledWith({ active: false })
  })
})
