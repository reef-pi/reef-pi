import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { FaEdit, FaTrashAlt } from 'react-icons/fa'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import ToggleSwitch from '../../design-system/ui_kits/reef-pi-app/primitives/ToggleSwitch'
import { useEquipmentToggle } from '../../design-system/ui_kits/reef-pi-app/hooks/useEquipmentToggle'

const rowStyle = {
  alignItems: 'center',
  display: 'grid',
  gap: 'var(--reefpi-space-sm)',
  gridTemplateColumns: 'minmax(0, 1fr) auto auto',
  width: '100%'
}

const nameStyle = {
  display: 'grid',
  gap: 'var(--reefpi-space-xxs)',
  minWidth: 0
}

const outletStyle = {
  color: 'var(--reefpi-color-text-muted)',
  fontSize: '0.8125rem',
  fontStyle: 'italic'
}

const actionStyle = {
  alignItems: 'center',
  display: 'inline-flex',
  gap: 'var(--reefpi-space-xs)'
}

function PendingToggle ({ equipment, onStateChange }) {
  const send = useCallback(next => {
    const payload = {
      name: equipment.name,
      on: next === 'on',
      outlet: equipment.outlet,
      stay_off_on_boot: equipment.stay_off_on_boot
    }
    return fetch(`/api/equipment/${equipment.id}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      onStateChange(equipment.id, payload)
    })
  }, [equipment, onStateChange])

  const { mutate, state, retry } = useEquipmentToggle({
    id: equipment.id,
    name: equipment.name,
    send
  })

  return (
    <ToggleSwitch
      state={state === 'idle' || state === 'ok'
        ? (equipment.on ? 'on' : 'off')
        : state}
      onRequestChange={next => mutate(next)}
      onRetry={retry}
    />
  )
}

const ViewEquipment = ({ equipment, outletName, onStateChange, onDelete, onEdit }) => {
  return (
    <div style={rowStyle}>
      <div style={nameStyle}>
        <span>{equipment.name}</span>
        <small style={outletStyle}>{outletName}</small>
      </div>
      <PendingToggle equipment={equipment} onStateChange={onStateChange} />
      <div style={actionStyle}>
        <Button type='button' variant='ghost' icon={<FaEdit />} iconOnly aria-label='Edit equipment' data-testid='equipment-edit' onClick={onEdit} />
        <Button type='button' variant='ghost' icon={<FaTrashAlt />} iconOnly aria-label='Delete equipment' data-testid='equipment-delete' onClick={onDelete} />
      </div>
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
