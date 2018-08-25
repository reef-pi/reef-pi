import React from 'react'
import PropTypes from 'prop-types'
import OnOffButton from './on_off_button'

const EditEquipment = ({equipment, outlets, onSubmit, onDelete}) => {

  return (
    <form onSubmit={onSubmit}>
      <div className='row text-center text-md-left'>
        <div className='col-12 col-sm-6 col-md-4 col-lg-4 order-sm-4 order-lg-last'>
          <button type="button"
            onClick = {onDelete}
            className="btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2">
            Delete
          </button>
        </div>
        <div className='col-12 col-sm-6 col-md-4 col-lg-4 order-sm-1 form-inline'>
          <label className='mr-2'>Name</label>
          <input type='text' name='equipment.name'
            onChange={() => {}}
            className='form-control'
            value={equipment.name}
          />
        </div>
        <div className='col-12 col-sm-6 col-md-4 col-lg-4 order-sm-2 form-inline'>
          <label className='mr-2'>Outlet</label>
          <select name='equipment.name'
            className='form-control'
            value={equipment.outlet} >
            {outlets.map((item) => {
              return (
                <option
                  value={item.id} >
                  {item.name}
                </option>
              )
            })}
          </select>
        </div>
      </div>
      <div className='clearfix'>
        <input type='submit' value='Save' className='btn btn-sm btn-primary float-right mt-1' />
      </div>
    </form>
  )
}

export default EditEquipment
