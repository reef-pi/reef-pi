import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { FaEllipsisV } from 'react-icons/fa'
import i18next from 'utils/i18n'
import ToggleSwitch from '../../design-system/ui_kits/reef-pi-app/primitives/ToggleSwitch'
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'
import { useEquipmentToggle } from '../../design-system/ui_kits/reef-pi-app/hooks/useEquipmentToggle'
import { controlEquipment } from './utils'

const outletStyle = {
  color: 'var(--reefpi-color-text-muted)',
  fontSize: '0.8125rem',
  fontFamily: 'var(--reefpi-font-mono)'
}

function commandStateLabel (state, on) {
  if (state === 'pending') return i18next.t('equipment:command_pending', { defaultValue: 'Command pending' })
  if (state === 'error') return i18next.t('equipment:command_failed', { defaultValue: 'Command failed' })
  if (on === true) return i18next.t('equipment:commanded_on', { defaultValue: 'Commanded on' })
  if (on === false) return i18next.t('equipment:commanded_off', { defaultValue: 'Commanded off' })
  return i18next.t('equipment:command_state_unknown', { defaultValue: 'Command state unknown' })
}

function PendingToggle ({ equipment, onStateChange }) {
  const send = useCallback(next => {
    const on = next === 'on'
    return controlEquipment(equipment.id, on).then(() => onStateChange(equipment.id, { on }))
  }, [equipment, onStateChange])

  const { mutate, state, retry } = useEquipmentToggle({
    id: equipment.id,
    name: equipment.name,
    send
  })

  return (
    <div className='reefpi-equipment-row__controls'>
      <span className='reefpi-equipment-state' role='status' aria-live='polite'>
        {commandStateLabel(state, equipment.on)}
      </span>
      <ToggleSwitch
        state={state === 'idle' || state === 'ok'
          ? (equipment.on === true ? 'on' : 'off')
          : state}
        onRequestChange={next => mutate(next)}
        onRetry={retry}
      />
    </div>
  )
}

const ViewEquipment = ({ equipment, outletName, onStateChange, onDelete, onEdit }) => {
  return (
    <div className='reefpi-equipment-row' data-testid={`equipment-row-${equipment.id}`}>
      <div className='reefpi-equipment-row__identity'>
        <span style={{ fontWeight: 600 }}>{equipment.name}</span>
        <small style={outletStyle}>{outletName}</small>
      </div>
      <PendingToggle equipment={equipment} onStateChange={onStateChange} />
      <Menu
        buttonAriaLabel={i18next.t('equipment:actions', { defaultValue: 'Equipment actions' })}
        buttonLabel={<span aria-hidden='true'><FaEllipsisV /></span>}
        items={[
          { label: i18next.t('edit', { defaultValue: 'Edit' }), onSelect: onEdit },
          { label: i18next.t('delete', { defaultValue: 'Delete' }), onSelect: onDelete }
        ]}
      />
    </div>
  )
}

ViewEquipment.propTypes = {
  equipment: PropTypes.object,
  outletName: PropTypes.string,
  onStateChange: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func
}

export default ViewEquipment
