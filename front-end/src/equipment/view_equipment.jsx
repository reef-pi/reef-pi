import React from 'react'
import PropTypes from 'prop-types'
import Switch from 'react-toggle-switch'
import { FaEdit, FaTrashAlt } from 'react-icons/fa'
import i18next from 'i18next'

const ViewEquipment = ({ equipment, outletName, onStateChange, onDelete, onEdit }) => {
  const toggleState = (e) => {
    const payload = {
      name: equipment.name,
      on: !equipment.on,
      outlet: equipment.outlet,
      stay_off_on_boot: equipment.stay_off_on_boot
    }
    onStateChange(equipment.id, payload)
  }

  return (
    <div className='d-flex'>
      <div className='p-2'>
        {equipment.name}
      </div>
      <div className='p-2 mr-auto font-italic'>
        <small>{outletName}</small>
      </div>
      <div className='p-2'>
        <Switch onClick={toggleState} on={equipment.on}>
          <small className='ml-1 align-top'>{equipment.on ? i18next.t('on') : i18next.t('off')}</small>
        </Switch>
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
