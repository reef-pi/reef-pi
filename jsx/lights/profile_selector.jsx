import React from 'react'
import PropTypes from 'prop-types'

const ProfileSelector = (props) => {

  const uuid = Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)

  const handleChange = e => {
    e.target.name = props.name
    props.onChangeHandler(e)
  }

  return (
    <div>
      <div className='d-sm-none'>
        <select className="custom-select"
          name={props.name + uuid}
          onChange={handleChange} >
          <option value="fixed">Fixed</option>
          <option value="auto">Auto</option>
          <option value="diurnal">Diurnal</option>
        </select>
      </div>
      <div className='btn-group  d-none d-sm-inline'>
        <label className='btn btn-secondary'>
          <input type='radio' value='fixed'
            checked={props.value === 'fixed'}
            name={props.name + uuid}
            id={props.name + uuid + '-fixed'}
            onChange={handleChange}
            disabled={props.readOnly}                  
          />
          Fixed
        </label>
        <label className='btn btn-secondary'>
          <input type='radio' value='auto'
            checked={props.value === 'auto'}
            name={props.name + uuid}
            id={props.name + uuid + '-auto'}
            onChange={handleChange}
            disabled={props.readOnly}                    
          />
          Auto
        </label>
        <label className='btn btn-secondary'>
          <input type='radio' value='diurnal'
            checked={props.value === 'diurnal'}
            name={props.name + uuid}
            id={props.name + uuid + '-diurnal'}
            onChange={handleChange}
            disabled={props.readOnly}
          />
          Diurnal
        </label>
      </div>
    </div>
  )
}

ProfileSelector.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  onChangeHandler: PropTypes.func
}

export default ProfileSelector