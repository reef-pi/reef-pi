import React from 'react'
import i18n from 'utils/i18n'
import ControllerSummary from '../ui_components/controller_summary'

// Read-only view of a dosing pump (#3305): labelled values, not disabled form controls.

const SCHEDULE_DEFAULTS = {
  'doser:daily_at': 'Every day at {{time}}',
  'doser:daily_fields': 'Every day: hour {{hour}}, minute {{minute}}, second {{second}}',
  'doser:schedule_fields': 'Day {{day}}, month {{month}}, weekday {{week}}: hour {{hour}}, minute {{minute}}, second {{second}}'
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
    return ['doser:daily_at', { time: [hour, minute, second].map(value => value.padStart(2, '0')).join(':') }]
  }
  if (daily) return ['doser:daily_fields', { hour, minute, second }]
  return ['doser:schedule_fields', { day, month, week, hour, minute, second }]
}

const nameOf = (id, items = []) => {
  if (id === undefined || id === null || id === '') return i18n.t('not_configured', { defaultValue: 'Not configured' })
  return items.find(item => item.id === id)?.name || id
}

const withUnit = (value, unit) => (value === undefined || value === null || value === '' ? undefined : `${value} ${unit}`)

export default function DoserSummary ({ doser, jacks, outlets, children }) {
  const regiment = doser.regiment || {}
  const stepper = doser.type === 'stepper'
  const rate = regiment.volume_per_second
  const calibrated = typeof rate === 'number' && rate > 0

  const pumpItems = [
    {
      label: i18n.t('doser:type'),
      value: stepper ? i18n.t('doser:type_stepper', { defaultValue: 'Stepper' }) : i18n.t('doser:type_dcpump', { defaultValue: 'DC motor' })
    }
  ]
  if (stepper) {
    const config = doser.stepper || {}
    pumpItems.push(
      { label: i18n.t('doser:step_pin'), value: nameOf(config.step_pin, outlets) },
      { label: i18n.t('doser:direction_pin'), value: nameOf(config.direction_pin, outlets) },
      { label: i18n.t('doser:vpr'), value: withUnit(config.vpr, 'mL') }
    )
  } else {
    pumpItems.push(
      { label: i18n.t('doser:connection', { defaultValue: 'Connection' }), value: `${nameOf(doser.jack, jacks)} · ${i18n.t('pin')} ${doser.pin}` },
      {
        label: i18n.t('doser:calibration:current_rate'),
        value: calibrated ? `${rate.toFixed(3)} mL/s` : i18n.t('doser:calibration:not_calibrated', { defaultValue: 'Not calibrated yet' })
      }
    )
  }

  const dosingItems = []
  if (regiment.continuous) {
    dosingItems.push({ label: i18n.t('schedule'), value: i18n.t('doser:continuous_mode', { defaultValue: 'Continuous' }) })
  } else {
    const [key, values] = scheduleText(regiment.schedule)
    dosingItems.push({ label: i18n.t('schedule'), value: i18n.t(key, { ...values, defaultValue: SCHEDULE_DEFAULTS[key] }) })
    // A calibrated DC pump doses a volume; an uncalibrated one runs for a duration (as its form asks).
    dosingItems.push(stepper || calibrated
      ? { label: i18n.t('doser:volume'), value: withUnit(regiment.volume, 'mL') }
      : { label: i18n.t('doser:duration'), value: withUnit(regiment.duration, 's') })
  }
  if (!stepper) {
    dosingItems.push(
      { label: i18n.t('doser:speed'), value: withUnit(regiment.speed, '%') },
      { label: i18n.t('doser:soft_start'), value: regiment.soft_start > 0 ? withUnit(regiment.soft_start, 's') : i18n.t('disabled') }
    )
  }

  return (
    <ControllerSummary
      sections={[
        { title: i18n.t('doser:pump_section', { defaultValue: 'Pump' }), items: pumpItems },
        { title: i18n.t('doser:dosing_section', { defaultValue: 'Dosing' }), items: dosingItems }
      ]}
    >
      {children}
    </ControllerSummary>
  )
}
