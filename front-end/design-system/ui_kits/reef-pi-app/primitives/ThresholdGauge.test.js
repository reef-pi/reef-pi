import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import ThresholdGauge from './ThresholdGauge'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('design-system ThresholdGauge', () => {
  it('renders default safe-only gauge with meter semantics', () => {
    const html = renderToStaticMarkup(<ThresholdGauge value={50} unit='%' label='Reservoir' />)

    expect(html).toContain('role="meter"')
    expect(html).toContain('aria-label="Reservoir"')
    expect(html).toContain('aria-valuemin="0"')
    expect(html).toContain('aria-valuemax="100"')
    expect(html).toContain('50%, within safe range')
  })

  it('renders safe and warning zones around the current value', () => {
    const html = renderToStaticMarkup(
      <ThresholdGauge value={78} safe={[76, 80]} warn={[74, 82]} critical={[70, 86]} unit='F' />
    )

    expect(html).toContain('78F')
    expect(html).toContain('within safe range')
    expect(html).toContain('var(--reefpi-color-band-safe)')
    expect(html).toContain('var(--reefpi-color-band-warn)')
    expect(html).toContain('var(--reefpi-color-band-critical)')
  })

  it('uses warning styling outside safe range but inside warning range', () => {
    const html = renderToStaticMarkup(
      <ThresholdGauge value={81} safe={[76, 80]} warn={[74, 82]} critical={[70, 86]} />
    )

    expect(html).toContain('81, in warning zone')
    expect(html).toContain('var(--reefpi-color-warn)')
  })

  it('anchors the value label above the indicator and renders the unit as a subscript', () => {
    const html = renderToStaticMarkup(
      <ThresholdGauge value={78.4} safe={[76, 80]} warn={[74, 82]} critical={[70, 86]} unit='°F' label='Display Tank' />
    )

    expect(html).toContain('class="reefpi-threshold-gauge__value"')
    expect(html).toContain('left:52.5%')
    expect(html).toContain('78.4<sub')
    expect(html).toContain('°F</sub>')
    expect(html).toContain('aria-valuetext="78.4°F, within safe range"')
  })

  it('renders a safe band with critical edges when no warning band is provided', () => {
    const html = renderToStaticMarkup(
      <ThresholdGauge value={7.9} safe={[7.8, 8.2]} critical={[7.4, 8.6]} unit='pH' />
    )

    expect(html).toContain('var(--reefpi-color-band-safe)')
    expect(html).toContain('var(--reefpi-color-band-critical)')
    expect(html).not.toContain('var(--reefpi-color-band-warn)')
    expect(html).toContain('7.9pH, within safe range')
  })

  it('renders a target-only safe band when no safe range is supplied', () => {
    const html = renderToStaticMarkup(
      <ThresholdGauge value={8.1} warn={[7.9, 8.3]} critical={[7.4, 8.6]} unit='pH' />
    )

    expect(html).toContain('var(--reefpi-color-band-safe)')
    expect(html).not.toContain('var(--reefpi-color-band-warn)')
    expect(html).toContain('8.1pH, within safe range')
  })

  it('notifies when the value exceeds critical bounds', () => {
    const onBoundsExceeded = jest.fn()
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(
        <ThresholdGauge
          value={90}
          safe={[76, 80]}
          warn={[74, 82]}
          critical={[70, 86]}
          onBoundsExceeded={onBoundsExceeded}
        />
      )
    })

    expect(onBoundsExceeded).toHaveBeenCalledWith(90)

    act(() => root.unmount())
  })
})
