import React from 'react'
import renderer from 'react-test-renderer'
import Capabilities from './capabilities'

describe('render capabilities component', () => {
  it('<Capabilities />', () => {
    const component = renderer.create(
      <Capabilities capabilities={[]} update={() => {}} />
    )

    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
