import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import Sparkline from './Sparkline'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

class ResizeObserverMock {
  observe () {}
  disconnect () {}
}

describe('design-system Sparkline', () => {
  beforeEach(() => {
    global.ResizeObserver = ResizeObserverMock
  })

  it('renders nothing for empty data', () => {
    expect(renderToStaticMarkup(<Sparkline points={[]} />)).toBe('')
    expect(renderToStaticMarkup(<Sparkline />)).toBe('')
  })

  it('renders numeric points with gradient fill and threshold band', () => {
    const html = renderToStaticMarkup(
      <Sparkline points={[1, 4, 2]} fill='gradient' band={[2, 3]} height={40} />
    )

    expect(html).toContain('role="img"')
    expect(html).toContain('<linearGradient')
    expect(html).toContain('<rect')
    expect(html).toContain('<polyline')
    expect(html).toContain('points="0,36 150,4 300,25.333333333333336"')
  })

  it('supports hover callbacks and keyboard navigation', () => {
    const onHover = jest.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(<Sparkline points={[{ t: 10, v: 1 }, { t: 20, v: 3 }]} hover onHover={onHover} />)
    })

    const svg = container.querySelector('svg')
    svg.getBoundingClientRect = () => ({ left: 0, width: 300 })

    act(() => {
      svg.dispatchEvent(new MouseEvent('pointermove', { clientX: 280, bubbles: true }))
    })
    expect(onHover).toHaveBeenCalledWith({ t: 20, v: 3 })
    expect(container.querySelector('circle')).not.toBeNull()

    act(() => {
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    })
    expect(container.querySelector('line')).not.toBeNull()

    act(() => root.unmount())
    container.remove()
  })
})
