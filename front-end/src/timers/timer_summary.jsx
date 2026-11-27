import React from 'react'
import i18n from 'utils/i18n'
import ControllerSummary from '../ui_components/controller_summary'
import { describeSchedule } from '../utils/schedule_text'

// Read-only view of a timer (#3307): what it does and when, as labelled values rather than disabled controls.

const nameOf = (id, items = []) => {
  if (id === undefined || id === null || id === '') return i18n.t('not_configured', { defaultValue: 'Not configured' })
  return items.find(item => item.id === id)?.name || id
}

export default function TimerSummary ({ timer, equipment, macros, atos, phprobes, tcs, dosers, lights }) {
  const target = timer.target || {}
  const lists = { equipment, macro: macros, ato: atos, phprobes, temperature: tcs, doser: dosers, lightings: lights }

  const actionItems = [{ label: i18n.t('timers:function'), value: i18n.t('function:' + timer.type) }]
  if (timer.type === 'reminder') {
    actionItems.push(
      { label: i18n.t('timers:subject'), value: target.title },
      { label: i18n.t('timers:message'), value: target.message }
    )
  } else {
    const on = target.on === true || target.on === 'true'
    const revert = target.revert === true || target.revert === 'true'
    const macro = timer.type === 'macro'
    actionItems.push(
      { label: i18n.t('timers:target', { defaultValue: 'Target' }), value: nameOf(target.id, lists[timer.type]) },
      { label: i18n.t('timers:action'), value: i18n.t(macro ? (on ? 'timers:run' : 'timers:reverse') : (on ? 'timers:turn_on' : 'timers:turn_off')) }
    )
    if (macro && revert) actionItems.push({ label: i18n.t('timers:and_then'), value: i18n.t(on ? 'timers:reverse' : 'timers:run') })
    if (!macro) actionItems.push({ label: i18n.t('timers:and_then'), value: i18n.t(revert ? (on ? 'timers:turn_back_off' : 'timers:turn_back_on') : (on ? 'timers:stay_on' : 'timers:stay_off')) })
    // The duration only applies when the timer turns back; the form hides it otherwise.
    if (revert) actionItems.push({ label: i18n.t('timers:after'), value: target.duration === undefined || target.duration === '' ? undefined : `${target.duration} s` })
  }

  return (
    <ControllerSummary
      sections={[
        { title: i18n.t('timers:action_section', { defaultValue: 'Action' }), items: actionItems },
        {
          title: i18n.t('timers:schedule_section', { defaultValue: 'Schedule' }),
          items: [{ label: i18n.t('timers:when', { defaultValue: 'When' }), value: describeSchedule(timer) }]
        }
      ]}
    />
  )
}
