import { useCallback, useRef, useState } from 'react'

/*
 * State machine: idle → pending → ok | error
 *
 * On error, retry() re-enters pending and re-runs send().
 * Exponential backoff delays apply between automatic retries;
 * manual retry() bypasses the delay.
 *
 * When maxRetries is exhausted the hook stays in error and
 * dispatches an alert via onAlert (wired to alert-center #17).
 */

function backoffMs (attempt, base = 500) {
  return Math.min(base * Math.pow(2, attempt), 16000)
}

export function useAckMutation ({
  send,
  ackTimeoutMs = 3000,
  maxRetries = 3,
  backoff = 'exponential',
  backoffBaseMs = 500,
  onAlert
}) {
  const [state, setState] = useState('idle')   // idle | pending | ok | error
  const [error, setError] = useState(null)

  const attemptsRef   = useRef(0)
  const timeoutRef    = useRef(null)
  const backoffRef    = useRef(null)
  const pendingArgRef = useRef(null)

  const clearTimers = () => {
    if (timeoutRef.current)  { clearTimeout(timeoutRef.current);  timeoutRef.current  = null }
    if (backoffRef.current)  { clearTimeout(backoffRef.current);  backoffRef.current  = null }
  }

  const run = useCallback((next, isRetry = false) => {
    clearTimers()
    if (!isRetry) attemptsRef.current = 0
    pendingArgRef.current = next

    setState('pending')
    setError(null)

    const attempt = () => {
      const promise = send(pendingArgRef.current)

      // Ack timeout
      timeoutRef.current = setTimeout(() => {
        attemptsRef.current += 1
        if (attemptsRef.current <= maxRetries) {
          const delay = backoff === 'exponential'
            ? backoffMs(attemptsRef.current - 1)
            : backoffBaseMs
          backoffRef.current = setTimeout(attempt, delay)
        } else {
          const msg = `Command timed out after ${maxRetries} retries`
          setError(msg)
          setState('error')
          onAlert?.({ severity: 'critical', message: msg, ts: Date.now() })
        }
      }, ackTimeoutMs)

      Promise.resolve(promise).then(() => {
        clearTimers()
        setState('ok')
        setError(null)
        attemptsRef.current = 0
      }).catch(err => {
        clearTimers()
        attemptsRef.current += 1
        if (attemptsRef.current <= maxRetries) {
          const delay = backoff === 'exponential'
            ? backoffMs(attemptsRef.current - 1)
            : backoffBaseMs
          backoffRef.current = setTimeout(attempt, delay)
        } else {
          const msg = err?.message || 'Command failed'
          setError(msg)
          setState('error')
          onAlert?.({ severity: 'critical', message: msg, ts: Date.now() })
        }
      })
    }

    attempt()
  }, [send, ackTimeoutMs, maxRetries, backoff, onAlert])

  const mutate = useCallback(next => run(next, false), [run])

  const retry = useCallback(() => {
    if (pendingArgRef.current === null) return
    attemptsRef.current = 0
    run(pendingArgRef.current, true)
  }, [run])

  const reset = useCallback(() => {
    clearTimers()
    setState('idle')
    setError(null)
    attemptsRef.current = 0
    pendingArgRef.current = null
  }, [])

  return { mutate, state, error, retry, reset }
}
