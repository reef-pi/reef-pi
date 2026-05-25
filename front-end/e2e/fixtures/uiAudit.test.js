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
