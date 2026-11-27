import i18n from 'utils/i18n'

// Cron-style schedule fields in words, shared by the doser and timer summaries.

const DEFAULTS = {
  'cron:daily_at': 'Every day at {{time}}',
  'cron:daily_fields': 'Every day: hour {{hour}}, minute {{minute}}, second {{second}}',
  'cron:schedule_fields': 'Day {{day}}, month {{month}}, weekday {{week}}: hour {{hour}}, minute {{minute}}, second {{second}}'
}

const isNumber = value => /^\d+$/.test(value)
const isAny = value => value === '*' || value === '?'

// "Every day at 03:00:00" for a daily schedule at one time; otherwise every cron field as entered,
// labelled, so a list or step ("1,9,17", "*/2") never reads as a clock time.
export function scheduleText (schedule = {}) {
  const field = (name, fallback) => (schedule[name] === undefined || schedule[name] === '' ? fallback : String(schedule[name]))
  const hour = field('hour', '0')
  const minute = field('minute', '0')
  const second = field('second', '0')
  const day = field('day', '*')
  const month = field('month', '*')
  const week = field('week', '*')
  const daily = isAny(day) && isAny(month) && isAny(week)
  if (daily && [hour, minute, second].every(isNumber)) {
    return ['cron:daily_at', { time: [hour, minute, second].map(value => value.padStart(2, '0')).join(':') }]
  }
  if (daily) return ['cron:daily_fields', { hour, minute, second }]
  return ['cron:schedule_fields', { day, month, week, hour, minute, second }]
}

export function describeSchedule (schedule) {
  const [key, values] = scheduleText(schedule)
  return i18n.t(key, { ...values, defaultValue: DEFAULTS[key] })
}
