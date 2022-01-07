import React from 'react'
import PropTypes from 'prop-types'
import i18next from 'i18next'

const ViewInstance = ({ instance, onStateChange, onDelete, onEdit }) => {
/*
  const toggleState = (e) => {
    const payload = {
      name: instance.name,
      address: instance.address,
      user: instance.user,
      password: instance.password
    }
    onStateChange(instance.id, payload)
  }
  */

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
        <b>{instance.name}</b>
      </div>
      <div className='col-12 col-sm-6 col-md-3 order-sm-1'>
        <b>{instance.address}</b>
      </div>
    </div>
  )
}

ViewInstance.propTypes = {
  instance: PropTypes.object,
  onStateChange: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func
}

export default ViewInstance
