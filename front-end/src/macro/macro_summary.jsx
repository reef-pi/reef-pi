import React from 'react'
import PropTypes from 'prop-types'
import i18n from 'utils/i18n'
import ControllerSummary from '../ui_components/controller_summary'

const isTrue = value => value === true || value === 'true'

const nameOf = (id, items = []) => {
  if (id === undefined || id === null || id === '') return i18n.t('not_configured', { defaultValue: 'Not configured' })
  return items.find(item => item.id === id)?.name || id
}

const subsystemTargets = () => [
  { id: 'timers', name: i18n.t('capabilities:timers') },
  { id: 'phprobes', name: i18n.t('capabilities:pH') },
  { id: 'ato', name: i18n.t('capabilities:ato') },
  { id: 'temperature', name: i18n.t('capabilities:temperature') },
  { id: 'lightings', name: i18n.t('capabilities:lighting') },
  { id: 'system', name: i18n.t('capabilities:system') },
  { id: 'doser', name: i18n.t('capabilities:doser') }
]

const joined = (...values) => {
  const present = values.filter(value => value !== undefined && value !== null && value !== '')
  return present.length ? present.join(' — ') : undefined
}

export default function MacroSummary ({ macro, equipment, timers, atos, tcs, phprobes, dosers, macros, lights, jacks }) {
  const lists = {
    equipment,
    timers,
    ato: atos,
    temperature: tcs,
    phprobes,
    doser: dosers,
    macro: macros,
    lightings: lights,
    pwm: jacks,
    subsystem: subsystemTargets()
  }

  const describeStep = step => {
    const config = step?.config || {}
    if (step?.type === 'wait') {
      return config.duration === undefined || config.duration === '' ? undefined : `${config.duration} ${i18n.t('second_s')}`
    }
    if (step?.type === 'alert') return joined(config.title, config.message)

    const target = nameOf(config.id, lists[step?.type])
    if (step?.type === 'pwm') {
      return joined(target, config.value === undefined || config.value === '' ? undefined : `${config.value}%`)
    }

    const on = isTrue(config.on)
    const action = step?.type === 'macro'
      ? i18n.t(on ? 'macro:run' : 'macro:revert')
      : step?.type === 'subsystem'
        ? i18n.t(on ? 'enabled' : 'disabled')
        : i18n.t(on ? 'macro:turn_on' : 'macro:turn_off')
    return joined(target, action)
  }

  const steps = Array.isArray(macro.steps) ? macro.steps : []
  const stepItems = steps.length
    ? steps.map((step, index) => ({
      label: `${index + 1}. ${i18n.t('function:' + step?.type, { defaultValue: step?.type || i18n.t('none') })}`,
      value: describeStep(step)
    }))
    : [{ label: i18n.t('macro:steps'), value: i18n.t('none') }]

  return (
    <ControllerSummary
      sections={[
        {
          title: i18n.t('macro:summary_section', { defaultValue: 'Macro' }),
          items: [{ label: i18n.t('macro:reversible'), value: i18n.t(isTrue(macro.reversible) ? 'yes' : 'no') }]
        },
        { title: i18n.t('macro:steps'), items: stepItems }
      ]}
    />
  )
}

MacroSummary.propTypes = {
  macro: PropTypes.object.isRequired,
  equipment: PropTypes.array,
  timers: PropTypes.array,
  atos: PropTypes.array,
  tcs: PropTypes.array,
  phprobes: PropTypes.array,
  dosers: PropTypes.array,
  macros: PropTypes.array,
  lights: PropTypes.array,
  jacks: PropTypes.array
}
