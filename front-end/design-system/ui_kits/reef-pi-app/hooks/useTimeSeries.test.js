import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { useTimeSeries } from './useTimeSeries'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const HookProbe = ({ metric, range, maxPoints, onUpdate }) => {
  const state = useTimeSeries({ metric, range, maxPoints })
  onUpdate(state)
  return <span>{state.points.length}</span>
}

const PairProbe = ({ metric, range, maxPoints, onUpdate }) => {
  const first = useTimeSeries({ metric, range, maxPoints })
  const second = useTimeSeries({ metric, range, maxPoints })
  onUpdate({ first, second })
  return <span>{first.points.length + second.points.length}</span>
}

describe('design-system useTimeSeries', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-05-14T12:00:00Z'))
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
    delete global.fetch
  })

  it('fetches telemetry and downsamples to max points', async () => {
    const raw = Array.from({ length: 10 }, (_, i) => ({ t: i, v: i % 2 ? 10 : 1 }))
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(raw) })
    const updates = []
    const container = document.createElement('div')
    const root = createRoot(container)

    await act(async () => {
      root.render(<HookProbe metric='temp' range='1h' maxPoints={4} onUpdate={state => updates.push(state)} />)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledWith('/api/telemetry/temp?range=1h')
    expect(updates.at(-1).loading).toBe(false)
    expect(updates.at(-1).error).toBeNull()
    expect(updates.at(-1).points).toHaveLength(4)
    expect(updates.at(-1).points[0]).toEqual(raw[0])
    expect(updates.at(-1).points.at(-1)).toEqual(raw.at(-1))

    act(() => root.unmount())
  })

  it('serves cached points for the same metric bucket and supports forced refetch', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ t: 1, v: 1 }]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ t: 2, v: 2 }]) })

    const updates = []
    const container = document.createElement('div')
    const root = createRoot(container)

    await act(async () => {
      root.render(<HookProbe metric='cached' range='1d' maxPoints={5} onUpdate={state => updates.push(state)} />)
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(fetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      root.render(<HookProbe metric='cached' range='1d' maxPoints={5} onUpdate={state => updates.push(state)} />)
      await Promise.resolve()
    })
    expect(fetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      await updates.at(-1).refetch()
      await Promise.resolve()
    })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(updates.at(-1).points).toEqual([{ t: 2, v: 2 }])

    act(() => root.unmount())
  })

  it('deduplicates concurrent requests and updates every subscriber', async () => {
    const raw = [{ t: 1, v: 1 }, { t: 2, v: 3 }]
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(raw) })
    const updates = []
    const container = document.createElement('div')
    const root = createRoot(container)

    await act(async () => {
      root.render(<PairProbe metric='shared' range='1h' maxPoints={5} onUpdate={state => updates.push(state)} />)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(updates.at(-1).first.points).toEqual(raw)
    expect(updates.at(-1).second.points).toEqual(raw)
    expect(updates.at(-1).first.loading).toBe(false)
    expect(updates.at(-1).second.loading).toBe(false)

    act(() => root.unmount())
  })

  it('returns cached points immediately and refreshes them in the background', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ t: 1, v: 1 }]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ t: 2, v: 2 }]) })

    const firstUpdates = []
    const firstContainer = document.createElement('div')
    const firstRoot = createRoot(firstContainer)

    await act(async () => {
      firstRoot.render(<HookProbe metric='swr' range='1d' maxPoints={5} onUpdate={state => firstUpdates.push(state)} />)
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    act(() => firstRoot.unmount())

    const secondUpdates = []
    const secondContainer = document.createElement('div')
    const secondRoot = createRoot(secondContainer)

    await act(async () => {
      secondRoot.render(<HookProbe metric='swr' range='1d' maxPoints={5} onUpdate={state => secondUpdates.push(state)} />)
      await Promise.resolve()
    })

    expect(secondUpdates[0].points).toEqual([{ t: 1, v: 1 }])
    expect(fetch).toHaveBeenCalledTimes(2)

    await act(async () => {
      await Promise.resolve()
    })
    expect(secondUpdates.at(-1).points).toEqual([{ t: 2, v: 2 }])
    expect(secondUpdates.at(-1).loading).toBe(false)

    act(() => secondRoot.unmount())
  })

  it('sets an error when telemetry fetch fails', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 })
    const updates = []
    const container = document.createElement('div')
    const root = createRoot(container)

    await act(async () => {
      root.render(<HookProbe metric='bad' range='6h' maxPoints={5} onUpdate={state => updates.push(state)} />)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(updates.at(-1).loading).toBe(false)
    expect(updates.at(-1).error).toBe('HTTP 500')

    act(() => root.unmount())
  })
})
