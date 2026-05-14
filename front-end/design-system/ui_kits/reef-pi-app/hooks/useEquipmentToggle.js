import { useCallback, useRef } from 'react'
import { useAckMutation } from './useAckMutation'
import { dispatchAlert } from './useAlertsStore'

/*
 * Combines useAckMutation + alert dispatch for equipment toggles.
 *
 * Error copy distinguishes:
 *   - relay-no-ack (timeout): device may be offline / unresponsive
 *   - permission (403):       operation not allowed
 *   - network (TypeError):    connection lost
 *   - other:                  raw message
 *
 * When maxRetries is exhausted, dispatches an alert into the alert center
 * with a retry callback so the user can re-enter pending from the alert row.
 *
 * Usage:
 *   const { mutate, state, error, retry, reset } = useEquipmentToggle({
 *     id: equipment.id,
 *     name: equipment.name,
 *     send: next => api.equipment.set(equipment.id, next)
 *   })
 */

function classifyError (message) {
  if (!message) return 'Command failed'
  if (/timed? out|timeout/i.test(message))              return 'Relay did not acknowledge — device may be offline'
  if (/forbidden|permission denied|403/i.test(message)) return 'Permission denied — check access control'
  if (/network|failed to fetch|load failed/i.test(message)) return 'Network error — check connection'
  return message
}

export function useEquipmentToggle ({
  id,
  name,
  send,
  ackTimeoutMs = 3000,
  maxRetries = 3
}) {
  // retryRef lets the alert's retry callback always call the current retry fn
  // even though the callback is captured at alert-dispatch time
  const retryRef = useRef(null)

  const onAlert = useCallback(({ severity, message, ts }) => {
    dispatchAlert({
      severity,
      title: `${name ?? id}: command failed`,
      detail: classifyError(message),
      ts,
      retry: () => retryRef.current?.()
    })
  }, [id, name])

  const { mutate, state, error, retry, reset } = useAckMutation({
    send,
    ackTimeoutMs,
    maxRetries,
    backoff: 'exponential',
    onAlert
  })

  // Keep ref current on every render (retry is stable via useCallback)
  retryRef.current = retry

  return { mutate, state, error, retry, reset }
}
