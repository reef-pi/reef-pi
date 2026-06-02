import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import fs from 'fs'
import path from 'path'
import Button from './Button'
import { List, ListItem } from './List'

describe('design-system List primitives', () => {
  it('renders semantic list and list item markup without Bootstrap classes', () => {
    const html = renderToStaticMarkup(
      <List>
        <ListItem leading={<span>P</span>} trailing='On'>Return pump</ListItem>
        <ListItem>Heater</ListItem>
      </List>
    )

    expect(html).toContain('<ul')
    expect(html).toContain('<li')
    expect(html).toContain('Return pump')
    expect(html).toContain('Heater')
    expect(html).not.toContain('list-group')
  })

  it('supports compact and roomy density while preserving tap target minimums', () => {
    const compact = renderToStaticMarkup(<List density='compact'><ListItem>Compact</ListItem></List>)
    const roomy = renderToStaticMarkup(<List density='roomy'><ListItem>Roomy</ListItem></List>)

    expect(compact).toContain('var(--reefpi-space-xs)')
    expect(roomy).toContain('var(--reefpi-space-md)')
    expect(compact).toContain('min-height:var(--reefpi-tap-target-min)')
    expect(roomy).toContain('min-height:var(--reefpi-tap-target-min)')
  })

  it('supports action rows, leading content, trailing content, and horizontal overflow safety', () => {
    const html = renderToStaticMarkup(
      <List>
        <ListItem
          leading={<span>ATO</span>}
          action={<Button variant='secondary'>Edit</Button>}
          trailing={<span>Enabled</span>}
        >
          Auto top off reservoir sensor with a long label
        </ListItem>
      </List>
    )

    expect(html).toContain('grid-template-columns:auto minmax(0, 1fr) auto')
    expect(html).toContain('min-width:0')
    expect(html).toContain('Auto top off reservoir sensor')
    expect(html).toContain('Edit')
  })

  it('renders empty-state handoff outside list markup', () => {
    const html = renderToStaticMarkup(<List empty='No equipment configured.' />)

    expect(html).toContain('No equipment configured.')
    expect(html).toContain('reefpi-list-empty')
    expect(html).not.toContain('<ul')
  })

  it('documents the preview story without Bootstrap list classes', () => {
    const story = fs.readFileSync(path.join(process.cwd(), 'front-end/design-system/preview/primitives/list.html'), 'utf8')

    expect(story).toContain('data-density="roomy"')
    expect(story).toContain('data-density="compact"')
    expect(story).toContain('No timers configured.')
    expect(story).not.toContain('list-group')
  })
})
