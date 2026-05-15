import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import SignInConfidenceCard from './SignInConfidenceCard'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('design-system SignInConfidenceCard', () => {
  afterEach(() => {
    delete global.fetch
    document.body.innerHTML = ''
  })

  it('renders nothing before metadata loads', () => {
    expect(renderToStaticMarkup(<SignInConfidenceCard />)).toBe('')
  })

  it('fetches metadata and renders controller identity details', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        name: 'Tank Controller',
        ip: '192.168.1.20',
        version: '6.0',
        device: 'rpi',
        uptime: 90061
      })
    }))
    const container = document.createElement('div')
    const root = createRoot(container)

    await act(async () => {
      root.render(<SignInConfidenceCard endpoint='/meta' />)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledWith('/meta')
    expect(container.textContent).toContain('Tank Controller')
    expect(container.textContent).toContain('192.168.1.20')
    expect(container.textContent).toContain('6.0')
    expect(container.textContent).toContain('rpi')
    expect(container.textContent).toContain('up 1d 1h')

    act(() => root.unmount())
  })

  it('stays hidden for failed responses and rejected fetches', async () => {
    const container = document.createElement('div')
    const root = createRoot(container)

    global.fetch = jest.fn(() => Promise.resolve({ ok: false }))
    await act(async () => {
      root.render(<SignInConfidenceCard />)
      await Promise.resolve()
    })
    expect(container.innerHTML).toBe('')

    global.fetch = jest.fn(() => Promise.reject(new Error('offline')))
    await act(async () => {
      root.render(<SignInConfidenceCard endpoint='/other' />)
      await Promise.resolve()
    })
    expect(container.innerHTML).toBe('')

    act(() => root.unmount())
  })
})
