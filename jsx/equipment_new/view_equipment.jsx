import React from 'react'
import PropTypes from 'prop-types'
import OnOffButton from './on_off_button'

const ViewEquipment = ({equipment, outletName, onStateChange, onDelete, onEdit}) => {

  return (
    <div className='row text-center text-md-left'>
      <div className="col-12 col-sm-6 col-md-4 col-lg-3 order-sm-4 order-lg-last">
        <button type="button" onClick={onDelete}
          className="btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2">
          Delete
        </button>
        <button type='button' onClick={onEdit}
          className='btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'>
          Edit
        </button>
      </div>
      <div className='col-13 col-sm-6 col-md-3 order-sm-1'>
        <b>{equipment.name}</b>
      </div>
      <div className='col-12 col-sm-6 col-md-3 col-lg-3 order-sm-2'>
        {outletName}
      </div>
      <div className='col-12 col-sm-6 col-md-2 col-lg-3 order-sm-3'>
        <OnOffButton value={equipment.on} onChangeHandler={onStateChange} />
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
