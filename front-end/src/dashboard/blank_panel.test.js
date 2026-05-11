import React from 'react'
import BlankPanel from './blank_panel'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div className='responsive-container'>{children}</div>
}))

describe('<BlankPanel />', () => {
  it('renders a container div with an empty responsive placeholder', () => {
    const panel = new BlankPanel({ height: 200 })
    const element = panel.render()
    const responsiveContainer = element.props.children
    const placeholder = responsiveContainer.props.children

    expect(element.props.className).toBe('container')
    expect(responsiveContainer.props.height).toBe(200)
    expect(responsiveContainer.props.width).toBe('100%')
    expect(placeholder.type).toBe('p')
    expect(placeholder.props.children).toBe('\u00a0')
  })

  it('toggles active state during lifecycle transitions', () => {
    const panel = new BlankPanel({ height: 200 })
    panel.setState = jest.fn(update => {
      panel.state = { ...panel.state, ...update }
    })

    expect(panel.state.active).toBeUndefined()

    panel.componentDidMount()

    expect(panel.setState).toHaveBeenCalledWith({ active: true })
    expect(panel.state.active).toBe(true)

    panel.componentWillUnmount()

    expect(panel.setState).toHaveBeenCalledWith({ active: false })
    expect(panel.state.active).toBe(false)
  })
})
