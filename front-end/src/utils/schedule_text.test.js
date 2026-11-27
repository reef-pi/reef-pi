import { scheduleText, describeSchedule } from './schedule_text'

describe('scheduleText (#3305, shared with timers #3307)', () => {
  it('reads a daily time plainly and pads it', () => {
    expect(scheduleText({ month: '*', week: '*', day: '*', hour: '3', minute: '0', second: '0' })).toEqual(['cron:daily_at', { time: '03:00:00' }])
  })

  it('treats ? like * and labels each time field when they are not single numbers', () => {
    expect(scheduleText({ month: '*', week: '?', day: '*', hour: '1,9,17', minute: '1', second: '1' }))
      .toEqual(['cron:daily_fields', { hour: '1,9,17', minute: '1', second: '1' }])
  })

  it('keeps every field of a non-daily schedule', () => {
    expect(scheduleText({ month: '*', week: '1', day: '*', hour: '*/2', minute: '0', second: '0' }))
      .toEqual(['cron:schedule_fields', { day: '*', month: '*', week: '1', hour: '*/2', minute: '0', second: '0' }])
  })

  it('falls back to midnight for missing time fields and to any for missing date fields', () => {
    expect(scheduleText({})).toEqual(['cron:daily_at', { time: '00:00:00' }])
  })
})

describe('describeSchedule', () => {
  it('returns the translated sentence', () => {
    expect(describeSchedule({ hour: '3', minute: '0', second: '0' })).toBe('Every day at 03:00:00')
    expect(describeSchedule({ week: '1', hour: '4', minute: '30', second: '0' }))
      .toBe('Day *, month *, weekday 1: hour 4, minute 30, second 0')
  })
})
