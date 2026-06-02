import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { FaEdit, FaTrashAlt } from 'react-icons/fa'
import ToggleSwitch from '../../design-system/ui_kits/reef-pi-app/primitives/ToggleSwitch'
import { useEquipmentToggle } from '../../design-system/ui_kits/reef-pi-app/hooks/useEquipmentToggle'

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
    <div className='d-flex'>
      <div className='p-2'>
        {equipment.name}
      </div>
      <div className='p-2 mr-auto font-italic'>
        <small>{outletName}</small>
      </div>
      <div className='p-2'>
        <PendingToggle equipment={equipment} onStateChange={onStateChange} />
      </div>
      <div className='p2'>
        <div className='d-inline p-2' onClick={onEdit}>
          {FaEdit()}
        </div>
        <div className='d-inline p-2' onClick={onDelete}>
          {FaTrashAlt()}
        </div>
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
