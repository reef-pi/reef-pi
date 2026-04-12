import React from 'react'
import renderer from 'react-test-renderer'
import BlankPanel from './blank_panel'

describe('<BlankPanel />', () => {
  it('renders without throwing', () => {
    expect(() => renderer.create(<BlankPanel height={200} />)).not.toThrow()
  })

  it('renders a container div', () => {
    const tree = renderer.create(<BlankPanel height={200} />).toJSON()
    expect(tree.props.className).toBe('container')
  })

  it('handles componentWillUnmount gracefully', () => {
    const component = renderer.create(<BlankPanel height={200} />)
    expect(() => component.unmount()).not.toThrow()
  })
})
