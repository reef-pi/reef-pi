const {
  createEmptyUiAuditEvents,
  isAllowedUiAuditEvent,
  normalizeObjectiveFindings,
  summarizeUiAuditEvents
} = require('./uiAudit')

describe('uiAudit objective helpers', () => {
  it('creates isolated event buckets', () => {
    const a = createEmptyUiAuditEvents()
    const b = createEmptyUiAuditEvents()
    a.consoleErrors.push({ text: 'boom' })
    expect(b.consoleErrors).toEqual([])
  })

  it('normalizes missing objective buckets', () => {
    expect(normalizeObjectiveFindings({ fatalText: [{ message: 'Something went wrong' }] })).toMatchObject({
      fatalText: [{ message: 'Something went wrong' }],
      tapTargets: [],
      overflow: [],
      missingAnchors: []
    })
  })

  it('normalizes null objective findings', () => {
    expect(normalizeObjectiveFindings(null)).toMatchObject({
      fatalText: [],
      consoleErrors: [],
      failedRequests: [],
      tapTargets: [],
      overflow: [],
      missingAnchors: []
    })
  })

  it('allowlists events by type and pattern', () => {
    const event = { type: 'failedRequest', url: 'http://127.0.0.1:8080/api/dev/expected-404', status: 404 }
    const allowlist = [{ type: 'failedRequest', pattern: '/api/dev/expected-404', reason: 'intentional dev fixture' }]
    expect(isAllowedUiAuditEvent(event, allowlist)).toBe(true)
  })

  it('only allowlists the given status when a rule names one', () => {
    const rule = { type: 'failedRequest', pattern: '/usage', status: 404, reason: 'no readings recorded yet' }
    const usage = status => ({ type: 'failedRequest', url: 'http://127.0.0.1:8080/api/tcs/1/usage', status })
    expect(isAllowedUiAuditEvent(usage(404), [rule])).toBe(true)
    expect(isAllowedUiAuditEvent(usage(401), [rule])).toBe(false)

    const consoleRule = { type: 'consoleError', pattern: '/usage', status: 404, reason: 'no readings recorded yet' }
    const consoleError = status => ({
      type: 'consoleError',
      text: `Failed to load resource: the server responded with a status of ${status} (Not Found)`,
      url: 'http://127.0.0.1:8080/api/tcs/1/usage'
    })
    expect(isAllowedUiAuditEvent(consoleError(404), [consoleRule])).toBe(true)
    expect(isAllowedUiAuditEvent(consoleError(401), [consoleRule])).toBe(false)
  })

  it('allowlists the 404 a dashboard chart gets before its probe has readings, but never a 401', () => {
    const { defaultUiAuditEventAllowlist } = require('./uiAudit')
    for (const url of ['/api/tcs/1/usage', '/api/atos/1/usage', '/api/phprobes/1/readings', '/api/lights/1/usage', '/api/doser/pumps/1/usage']) {
      expect(isAllowedUiAuditEvent({ type: 'failedRequest', url: `http://127.0.0.1:8080${url}`, status: 404 }, defaultUiAuditEventAllowlist)).toBe(true)
      expect(isAllowedUiAuditEvent({ type: 'failedRequest', url: `http://127.0.0.1:8080${url}`, status: 401 }, defaultUiAuditEventAllowlist)).toBe(false)
    }
  })

  it('summarizes unallowlisted console and request events as findings', () => {
    const events = createEmptyUiAuditEvents()
    events.consoleErrors.push({ text: 'React exploded', location: 'app.jsx:1' })
    events.failedRequests.push({ url: 'http://127.0.0.1:8080/api/bad', status: 500 })

    expect(summarizeUiAuditEvents(events, [])).toMatchObject({
      consoleErrors: [{ severity: 'error', message: 'React exploded' }],
      failedRequests: [{ severity: 'error', status: 500 }]
    })
  })
})
