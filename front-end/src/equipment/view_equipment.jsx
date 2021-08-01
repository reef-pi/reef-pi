import React from 'react'
import PropTypes from 'prop-types'
import Switch from 'react-toggle-switch'
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
    <div className='row text-center text-md-left'>
      <div className='col-12 col-sm-4 col-md-3'>
        <b>{equipment.name}</b>
      </div>
      <div className='col-12 col-sm-4 col-md-3'>
        {outletName}
      </div>
      <div className='col-12 col-sm-2 col-md-1'>
        <Switch onClick={toggleState} on={equipment.on}>
          <small className='ml-1 align-top'>{equipment.on ? i18next.t('on') : i18next.t('off')}</small>
        </Switch>
      </div>
      <div className='col-12 col-sm-2 col-md-1'>
        <div className='form-group'>
          <span className='input-group-addon'>
            <small> {i18next.t('stayoffonboot')}</small>
          </span>
          <input
            type='checkbox'
            id='stayOffOnBoot'
            className='form-control'
            checked={equipment.stay_off_on_boot}
            readOnly='true'
          />
        </div>
      </div>
      <div className='col-12 col-sm-2 col-md-1'>
        <button
          type='button' onClick={onDelete}
          className='btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2'
        >
          {i18next.t('delete')}
        </button>
        <button
          type='button' onClick={onEdit}
          className='btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'
        >
          {i18next.t('edit')}
        </button>
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
