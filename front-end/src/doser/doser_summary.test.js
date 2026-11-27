import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import DoserSummary, { scheduleText } from './doser_summary'

const dcPump = (regiment = {}, extra = {}) => ({
  id: '1',
  name: 'Pump1',
  type: 'dcpump',
  jack: 'j1',
  pin: 1,
  regiment: {
    enable: false,
    continuous: false,
    duration: 15,
    speed: 70,
    soft_start: 0,
    volume: 0,
    volume_per_second: 0,
    schedule: { month: '*', week: '*', day: '*', hour: '3', minute: '0', second: '0' },
    ...regiment
  },
  ...extra
})

const jacks = [{ id: 'j1', name: 'J1' }]
const outlets = [{ id: 'o1', name: 'Step out' }, { id: 'o2', name: 'Dir out' }]
const html = doser => renderToStaticMarkup(<DoserSummary doser={doser} jacks={jacks} outlets={outlets} />)

describe('<DoserSummary /> (#3305)', () => {
  it('is read-only labelled values in Pump and Dosing sections', () => {
    const out = html(dcPump())
    expect(out).toContain('<h3>Pump</h3>')
    expect(out).toContain('<h3>Dosing</h3>')
    expect(out).not.toMatch(/<input|<select/)
    expect(out).toContain('J1 · pin 1')
    expect(out).toContain('70 %')
    expect(out).toContain('15 s')
    expect(out).toContain('Not calibrated yet')
  })

  it('shows the dose as a volume once the pump is calibrated, with its rate', () => {
    const out = html(dcPump({ volume: 5, volume_per_second: 0.5 }))
    expect(out).toContain('5 mL')
    expect(out).toContain('0.500 mL/s')
    expect(out).not.toContain('15 s')
  })

  it('says a continuous pump has no per-dose amount or schedule', () => {
    const out = html(dcPump({ continuous: true }))
    expect(out).toContain('<dd>Continuous</dd>')
    expect(out).not.toContain('15 s')
  })

  it('names the stepper pins and dispenses a volume', () => {
    const out = html({
      id: '2',
      name: 'Stepper',
      type: 'stepper',
      stepper: { step_pin: 'o1', direction_pin: 'o2', vpr: 0.25 },
      regiment: { enable: true, volume: 3, schedule: { month: '*', week: '*', day: '*', hour: '4', minute: '30', second: '0' } }
    })
    expect(out).toContain('Step out')
    expect(out).toContain('Dir out')
    expect(out).toContain('3 mL')
    expect(out).toContain('0.25 mL')
    expect(out).not.toContain(' %')
  })
})

describe('scheduleText (#3305)', () => {
  it('reads a daily time plainly and pads it', () => {
    expect(scheduleText({ month: '*', week: '*', day: '*', hour: '3', minute: '0', second: '0' })).toEqual(['doser:daily_at', { time: '03:00:00' }])
  })

  it('treats ? like * and labels each time field when they are not single numbers', () => {
    expect(scheduleText({ month: '*', week: '?', day: '*', hour: '1,9,17', minute: '1', second: '1' }))
      .toEqual(['doser:daily_fields', { hour: '1,9,17', minute: '1', second: '1' }])
  })

  it('keeps every field of a non-daily schedule', () => {
    expect(scheduleText({ month: '*', week: '1', day: '*', hour: '*/2', minute: '0', second: '0' }))
      .toEqual(['doser:schedule_fields', { day: '*', month: '*', week: '1', hour: '*/2', minute: '0', second: '0' }])
  })
})
