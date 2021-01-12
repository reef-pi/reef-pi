import React from 'react'
import PropTypes from 'prop-types'
import Switch from 'react-toggle-switch'
import i18next from 'i18next'

const ViewEquipment = ({ equipment, outletName, onStateChange, onDelete, onEdit }) => {
  const toggleState = (e) => {
    const payload = {
      name: equipment.name,
      on: !equipment.on,
      outlet: equipment.outlet
    }
    onStateChange(equipment.id, payload)
  }

  return (
    <div className='row text-center text-md-left'>
      <div className='col-12 col-sm-6 col-md-4 col-lg-3 order-sm-2 order-md-last'>
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
      <div className='col-12 col-sm-6 col-md-3 order-sm-1'>
        <b>{equipment.name}</b>
      </div>
      <div className='col-12 col-sm-6 col-md-3 col-lg-3 order-sm-4'>
        {outletName}
      </div>
      <div className='col-12 col-sm-6 col-md-2 col-lg-3 order-sm-3'>
        <Switch onClick={toggleState} on={equipment.on}>
          <small className='ml-1 align-top'>{equipment.on ? 'on' : 'off'}</small>
        </Switch>
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
