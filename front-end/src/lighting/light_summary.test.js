import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import LightSummary from './light_summary'

const jacks = [{ id: 'jack-1', name: 'Main PWM' }]

const renderSummary = (light, mode = 'auto', children) => renderToStaticMarkup(
  <LightSummary light={light} jacks={jacks} mode={mode}>{children}</LightSummary>
)

describe('<LightSummary /> (#3309)', () => {
  it('resolves the jack and orders channel summaries by numeric pin', () => {
    const html = renderSummary({
      jack: 'jack-1',
      channels: {
        12: {
          name: 'White',
          pin: 12,
          value: 35,
          profile: { type: 'interval', config: { values: [0, 100] } }
        },
        2: {
          name: 'Blue',
          pin: 2,
          value: 0,
          profile: { type: 'fixed', config: { value: 0 } }
        }
      }
    })

    expect(html).toContain('<h3>Fixture</h3>')
    expect(html).toContain('<dt>Jack</dt><dd>Main PWM</dd>')
    expect(html).toContain('<dt>Control mode</dt><dd>Auto</dd>')
    expect(html.indexOf('Blue · Pin 2')).toBeLessThan(html.indexOf('White · Pin 12'))
    expect(html).toContain('<dt>Blue · Pin 2</dt><dd>Fixed · Current 0% · Configured 0%</dd>')
    expect(html).toContain('<dt>White · Pin 12</dt><dd>Interval · Current 35%</dd>')
    expect(html).not.toMatch(/<input|<select|<button/)
  })

  it.each([
    ['auto', 'Auto'],
    ['manual', 'Manual'],
    ['mixed', 'Mixed']
  ])('renders the %s control mode', (mode, label) => {
    expect(renderSummary({ jack: 'jack-1', channels: {} }, mode)).toContain(`<dt>Control mode</dt><dd>${label}</dd>`)
  })

  it('uses stable fallbacks for missing jack, channel name, and profile', () => {
    const missingJack = renderSummary({
      jack: 'gone',
      channels: {
        alpha: { pin: 4, value: 10 }
      }
    })

    expect(missingJack).toContain('<dt>Jack</dt><dd>gone</dd>')
    expect(missingJack).toContain('<dt>Light channel 1 · Pin 4</dt><dd>Not configured · Current 10%</dd>')

    const blank = renderSummary({ jack: '', channels: {} })
    expect(blank).toContain('<dt>Jack</dt><dd>Not configured</dd>')
    expect(blank).toContain('<dt>Channels</dt><dd>None</dd>')
  })

  it('handles a missing channels object and preserves summary children', () => {
    expect(() => renderSummary({ jack: 'jack-1' })).not.toThrow()

    const html = renderSummary(
      { jack: 'jack-1' },
      'manual',
      <div data-testid='manual-controls'>Manual intensity controls</div>
    )
    expect(html).toContain('data-testid="manual-controls"')
    expect(html).toContain('Manual intensity controls')
  })
})
