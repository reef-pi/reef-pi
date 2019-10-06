import React from 'react'
import renderer from 'react-test-renderer'
import Capabilities from './capabilities'

describe('render capabilities component', () => {
  it('<Capabilities />', () => {
    const component = renderer.create(
      <Capabilities capabilities={[]} update={() => {}} />
    )

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
