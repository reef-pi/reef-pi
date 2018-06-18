import React from 'react'
import renderer from 'react-test-renderer'
import Capabilities from './capabilities'

test('render capabilities component', () => {
  const component = renderer.create(
    <Capabilities capabilities={[]} update={() => {}} />
  )

  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})
