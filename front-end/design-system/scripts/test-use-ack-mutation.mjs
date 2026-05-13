/**
 * Unit tests for the useAckMutation state machine logic.
 * Extracted inline (no bundler). Run: node scripts/test-use-ack-mutation.mjs
 */

// ── Inline state machine (mirrors hook logic, sans React) ────────────────────

function backoffMs (attempt, base) {
  return Math.min(base * Math.pow(2, attempt), 16000)
}

function runMachine ({
  send,
  ackTimeoutMs = 3000,
  maxRetries = 3,
  backoff = 'exponential',
  backoffBaseMs = 500,
  onAlert,
  onStateChange
}) {
  let state = 'idle'
  let error = null
  let attempts = 0
  let pendingArg = null
  let timeoutHandle = null, backoffHandle = null

  const setState = (s, e = null) => {
    state = s; error = e
    onStateChange?.({ state, error })
  }

  const clearTimers = () => {
    clearTimeout(timeoutHandle); clearTimeout(backoffHandle)
  }

  const delay = attempt => backoff === 'exponential'
    ? backoffMs(attempt, backoffBaseMs)
    : backoffBaseMs

  const attempt_ = () => {
    const promise = send(pendingArg)

    timeoutHandle = setTimeout(() => {
      attempts++
      if (attempts <= maxRetries) {
        backoffHandle = setTimeout(attempt_, delay(attempts - 1))
      } else {
        const msg = `timed out after ${maxRetries} retries`
        setState('error', msg)
        onAlert?.({ severity: 'critical', message: msg })
      }
    }, ackTimeoutMs)

    Promise.resolve(promise).then(() => {
      clearTimers(); setState('ok'); attempts = 0
    }).catch(err => {
      clearTimers()
      attempts++
      if (attempts <= maxRetries) {
        backoffHandle = setTimeout(attempt_, delay(attempts - 1))
      } else {
        const msg = err?.message || 'failed'
        setState('error', msg)
        onAlert?.({ severity: 'critical', message: msg })
      }
    })
  }

  return {
    mutate (next) {
      clearTimers(); attempts = 0; pendingArg = next
      setState('pending')
      attempt_()
    },
    retry () {
      if (pendingArg === null) return
      clearTimers(); attempts = 0
      setState('pending')
      attempt_()
    },
    get state () { return state },
    get error () { return error }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0, failed = 0

function assert (desc, cond) {
  if (cond) { console.log('  ✓ ' + desc); passed++ }
  else       { console.error('  ✗ ' + desc); failed++ }
}

function wait (ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

// ── Test 1: Success path ─────────────────────────────────────────────────────

console.log('\nSuccess path')
await (async () => {
  const states = []
  const m = runMachine({
    send: () => Promise.resolve(),
    ackTimeoutMs: 50,
    onStateChange: s => states.push(s.state)
  })
  m.mutate('on')
  await wait(20)
  assert('transitions to pending immediately', states[0] === 'pending')
  assert('transitions to ok on resolve', m.state === 'ok')
  assert('error is null on ok', m.error === null)
})()

// ── Test 2: Timeout → exhausted ──────────────────────────────────────────────

console.log('\nTimeout exhausted (maxRetries=2, ackTimeoutMs=20ms, backoffBaseMs=10)')
await (async () => {
  const alerts = []
  const m = runMachine({
    send: () => new Promise(() => {}),   // never resolves
    ackTimeoutMs: 20,
    maxRetries: 2,
    backoff: 'linear',
    backoffBaseMs: 10,
    onAlert: a => alerts.push(a)
  })
  m.mutate('on')
  // 3 timeouts × 20ms + 2 delays × 10ms = 80ms; wait 250ms for slack
  await wait(250)
  assert('ends in error after max retries', m.state === 'error')
  assert('dispatches alert', alerts.length >= 1)
  assert('alert severity is critical', alerts[0]?.severity === 'critical')
})()

// ── Test 3: Reject → auto-retry → succeed ────────────────────────────────────

console.log('\nReject then auto-retry-then-succeed')
await (async () => {
  let call = 0
  const m = runMachine({
    send: () => {
      call++
      return call < 2 ? Promise.reject(new Error('nope')) : Promise.resolve()
    },
    ackTimeoutMs: 500,
    maxRetries: 3,
    backoff: 'linear',
    backoffBaseMs: 10
  })
  m.mutate('on')
  await wait(150)
  assert('eventually reaches ok', m.state === 'ok')
  assert('called send more than once', call >= 2)
})()

// ── Test 4: Max retries exhausted on reject ──────────────────────────────────

console.log('\nMax retries exhausted on reject')
await (async () => {
  const alerts = []
  const m = runMachine({
    send: () => Promise.reject(new Error('relay error')),
    ackTimeoutMs: 500,
    maxRetries: 2,
    backoff: 'linear',
    backoffBaseMs: 10,
    onAlert: a => alerts.push(a)
  })
  m.mutate('on')
  await wait(150)
  assert('state is error', m.state === 'error')
  assert('error message propagated', m.error && m.error.includes('relay error'))
  assert('alert dispatched', alerts.length >= 1)
})()

// ── Test 5: Manual retry resets attempt counter ──────────────────────────────

console.log('\nManual retry resets counter and re-enters pending')
await (async () => {
  let call = 0
  const m = runMachine({
    send: () => {
      call++
      return call < 3 ? Promise.reject(new Error('fail')) : Promise.resolve()
    },
    ackTimeoutMs: 500,
    maxRetries: 1,       // exhausts after 1 auto-retry
    backoff: 'linear',
    backoffBaseMs: 10
  })
  m.mutate('on')
  await wait(100)
  assert('hits error with maxRetries=1', m.state === 'error')
  m.retry()
  await wait(100)
  assert('manual retry re-enters pending then ok', m.state === 'ok')
})()

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) process.exit(1)
