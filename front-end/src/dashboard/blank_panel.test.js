import React from 'react'
import BlankPanel from './blank_panel'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div className='responsive-container'>{children}</div>
}))

describe('<BlankPanel />', () => {
  it('renders without throwing', () => {
    const panel = new BlankPanel({ height: 200 })
    expect(() => panel.render()).not.toThrow()
  })

  it('renders a container div', () => {
    const panel = new BlankPanel({ height: 200 })
    const element = panel.render()
    expect(element.props.className).toBe('container')
  })

  it('handles lifecycle transitions gracefully', () => {
    const panel = new BlankPanel({ height: 200 })
    panel.setState = jest.fn(update => {
      panel.state = { ...panel.state, ...update }
    })

    expect(() => panel.componentDidMount()).not.toThrow()
    expect(panel.state.active).toBe(true)
    expect(() => panel.componentWillUnmount()).not.toThrow()
    expect(panel.state.active).toBe(false)
  })
})
