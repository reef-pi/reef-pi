/**
 * Unit tests for the LTTB downsampler extracted from useTimeSeries.js.
 * Run: node scripts/test-use-time-series.mjs
 */

// ── Inline the algorithm (no bundler needed) ─────────────────────────────────

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
    if (rangeStart >= rangeEnd) continue
    const nextStart  = rangeEnd
    const nextEnd    = Math.min(Math.floor((i + 3) * bucketSize) + 1, n)
    let avgT = 0, avgV = 0
    for (let j = nextStart; j < nextEnd; j++) { avgT += data[j].t; avgV += data[j].v }
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

// ── Test helpers ──────────────────────────────────────────────────────────────

let passed = 0, failed = 0

function assert (desc, condition) {
  if (condition) {
    console.log(`  ✓ ${desc}`)
    passed++
  } else {
    console.error(`  ✗ ${desc}`)
    failed++
  }
}

// ── Build synthetic dataset: 1-second readings for 24 h (86 400 points) ──────

const BIG = Array.from({ length: 86_400 }, (_, i) => ({
  t: i,
  v: 78 + Math.sin(i / 3600 * Math.PI * 2) * 1.5 + Math.random() * 0.3
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

console.log('useTimeSeries — LTTB unit tests\n')

console.log('Output length')
const out120 = lttb(BIG, 120)
assert('output length === 120 for threshold=120', out120.length === 120)

const out60 = lttb(BIG, 60)
assert('output length === 60 for threshold=60', out60.length === 60)

assert('passthrough when threshold >= input length', lttb(BIG.slice(0, 10), 20).length === 10)

console.log('\nEndpoint preservation')
assert('first point preserved', out120[0].t === BIG[0].t && out120[0].v === BIG[0].v)
assert('last point preserved',  out120[out120.length - 1].t === BIG[BIG.length - 1].t)

console.log('\nMonotonicity (t strictly increasing)')
const monotone = out120.every((p, i) => i === 0 || p.t > out120[i - 1].t)
assert('t values strictly increasing after downsample', monotone)

console.log('\nEdge cases')
const single = [{ t: 0, v: 1 }]
assert('single-point passthrough', lttb(single, 120).length === 1)

const two = [{ t: 0, v: 1 }, { t: 1, v: 2 }]
assert('two-point passthrough', lttb(two, 120).length === 2)

assert('threshold=0 returns original', lttb(BIG.slice(0, 5), 0).length === 5)

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
