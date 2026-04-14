import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Capabilities from './capabilities'

describe('render capabilities component', () => {
  it('<Capabilities />', () => {
    const html = renderToStaticMarkup(
      <Capabilities capabilities={[]} update={() => {}} />
    )
    expect(html).toContain('id="update-equipment"')
    expect(html).toContain('id="update-dev_mode"')
    expect(html).toContain('type="checkbox"')
  })
})
