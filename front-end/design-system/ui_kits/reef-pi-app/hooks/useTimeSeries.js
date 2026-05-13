import { useCallback, useEffect, useRef, useState } from 'react'

// ── LTTB downsampling ───────────────────────────────────────────────────────

/**
 * Largest-Triangle-Three-Buckets algorithm.
 * Preserves visual peaks; guarantees output length == threshold.
 * Always keeps first and last point.
 */
function lttb (data, threshold) {
  const n = data.length
  if (threshold >= n || threshold === 0) return data

  const sampled = []
  let a = 0
  sampled.push(data[0])

  const bucketSize = (n - 2) / (threshold - 2)

  for (let i = 0; i < threshold - 2; i++) {
    const rangeStart = Math.min(Math.floor((i + 1) * bucketSize) + 1, n - 2)
    const rangeEnd   = Math.min(Math.floor((i + 2) * bucketSize) + 1, n - 1)

    if (rangeStart >= rangeEnd) continue  // degenerate bucket — skip

    // Next bucket average (used as "far" anchor)
    const nextStart = rangeEnd
    const nextEnd   = Math.min(Math.floor((i + 3) * bucketSize) + 1, n)
    let avgT = 0, avgV = 0
    for (let j = nextStart; j < nextEnd; j++) {
      avgT += data[j].t
      avgV += data[j].v
    }
    const nextLen = nextEnd - nextStart || 1
    avgT /= nextLen; avgV /= nextLen

    const aPoint = data[a]
    let maxArea = -1, maxIdx = rangeStart

    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs(
        (aPoint.t - avgT) * (data[j].v - aPoint.v) -
        (aPoint.t - data[j].t) * (avgV - aPoint.v)
      ) * 0.5
      if (area > maxArea) { maxArea = area; maxIdx = j }
    }

    sampled.push(data[maxIdx])
    a = maxIdx
  }

  sampled.push(data[n - 1])
  return sampled
}

// ── Cache ────────────────────────────────────────────────────────────────────

const BUCKET_MS = {
  '1h':  60_000,        // 1-min buckets
  '6h':  300_000,       // 5-min buckets
  '1d':  900_000,       // 15-min buckets
  '7d':  3_600_000,     // 1-hr buckets
  '30d': 14_400_000     // 4-hr buckets
}

function bucketKey (metric, range) {
  const bucket = Math.floor(Date.now() / (BUCKET_MS[range] || 60_000))
  return `${metric}:${range}:${bucket}`
}

const cache = new Map()   // key → { points, ts }
const inflight = new Map() // key → Promise

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTimeSeries ({ metric, range = '1d', maxPoints = 120 }) {
  const [state, setState] = useState(() => {
    const key = bucketKey(metric, range)
    const hit = cache.get(key)
    return { points: hit ? hit.points : [], loading: !hit, error: null }
  })

  const metricRef  = useRef(metric)
  const rangeRef   = useRef(range)
  const maxPtsRef  = useRef(maxPoints)
  metricRef.current  = metric
  rangeRef.current   = range
  maxPtsRef.current  = maxPoints

  const fetchData = useCallback(async (force = false) => {
    const m = metricRef.current
    const r = rangeRef.current
    const key = bucketKey(m, r)

    const cached = cache.get(key)
    if (cached && !force) {
      setState(s => ({ ...s, points: cached.points, loading: false, error: null }))
      return
    }

    // Stale-while-revalidate: show cached points immediately while fetching
    if (cached) {
      setState(s => ({ ...s, points: cached.points }))
    }

    // Deduplicate concurrent requests for the same key
    if (inflight.has(key)) {
      try { await inflight.get(key) } catch {}
      return
    }

    setState(s => ({ ...s, loading: true }))

    const promise = fetch(`/api/telemetry/${encodeURIComponent(m)}?range=${r}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(raw => {
        const points = lttb(raw, maxPtsRef.current)
        cache.set(key, { points, ts: Date.now() })
        inflight.delete(key)
        setState({ points, loading: false, error: null })
      })
      .catch(err => {
        inflight.delete(key)
        setState(s => ({ ...s, loading: false, error: err.message || 'Fetch failed' }))
      })

    inflight.set(key, promise)
    await promise
  }, [])

  useEffect(() => { fetchData() }, [metric, range, fetchData])

  const refetch = useCallback(() => fetchData(true), [fetchData])

  return { ...state, refetch }
}
