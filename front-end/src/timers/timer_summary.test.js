import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import TimerSummary from './timer_summary'

const schedule = { month: '*', week: '*', day: '*', hour: '3', minute: '0', second: '0' }
const equipment = [{ id: 'e1', name: 'Heater' }]
const macros = [{ id: 'm1', name: 'Water change' }]
const html = (timer, extra = {}) => renderToStaticMarkup(
  <TimerSummary timer={timer} equipment={equipment} macros={macros} {...extra} />
)

describe('<TimerSummary /> (#3307)', () => {
  it('is read-only labelled values in Action and Schedule sections', () => {
    const out = html({ type: 'equipment', ...schedule, target: { id: 'e1', on: true, revert: true, duration: 60 } })
    expect(out).toContain('<h3>Action</h3>')
    expect(out).toContain('<h3>Schedule</h3>')
    expect(out).not.toMatch(/<input|<select|<textarea/)
    expect(out).toContain('Heater')
    expect(out).toContain('Every day at 03:00:00')
  })

  it('says what happens: turn on, then turn back off after N seconds', () => {
    const out = html({ type: 'equipment', ...schedule, target: { id: 'e1', on: true, revert: true, duration: 60 } })
    expect(out).toContain('turn_on')
    expect(out).toContain('turn_back_off')
    expect(out).toContain('60 s')
  })

  it('says it stays on, with no duration, when it does not revert', () => {
    const out = html({ type: 'equipment', ...schedule, target: { id: 'e1', on: true, revert: false, duration: 60 } })
    expect(out).toContain('stay_on')
    expect(out).not.toContain('60 s')
  })

  it('uses Run / Reverse wording for a macro and names the macro', () => {
    const out = html({ type: 'macro', ...schedule, target: { id: 'm1', on: false, revert: false } })
    expect(out).toContain('Water change')
    expect(out).toContain('reverse')
    expect(out).not.toContain('stay_off')
  })

  it('describes a macro revert as the opposite macro action after its duration', () => {
    const out = html({ type: 'macro', ...schedule, target: { id: 'm1', on: true, revert: true, duration: 45 } })
    expect(out).toContain('Water change')
    expect(out).toContain('run')
    expect(out).toContain('reverse')
    expect(out).toContain('45 s')
    expect(out).not.toContain('turn_back_off')
  })

  it('normalizes string booleans from form values', () => {
    const out = html({ type: 'equipment', ...schedule, target: { id: 'e1', on: 'false', revert: 'true', duration: 15 } })
    expect(out).toContain('turn_off')
    expect(out).toContain('turn_back_on')
    expect(out).toContain('15 s')
    expect(out).not.toContain('turn_on')
  })

  it('shows a reminder\'s subject and message', () => {
    const out = html({ type: 'reminder', ...schedule, target: { title: 'Feed fish', message: 'Flakes' } })
    expect(out).toContain('Feed fish')
    expect(out).toContain('Flakes')
    expect(out).not.toContain('turn_on')
  })

  it('falls back to the id when the target is gone and to "Not configured" when none is set', () => {
    expect(html({ type: 'equipment', ...schedule, target: { id: 'gone', on: true, revert: false } })).toContain('gone')
    expect(html({ type: 'equipment', ...schedule, target: { id: '', on: true, revert: false } })).toContain('Not configured')
  })

  it('names targets of other subsystems from the lists it is given', () => {
    const out = html({ type: 'doser', ...schedule, target: { id: 'd1', on: true, revert: false } }, { dosers: [{ id: 'd1', name: 'Pump1' }] })
    expect(out).toContain('Pump1')
  })
})
