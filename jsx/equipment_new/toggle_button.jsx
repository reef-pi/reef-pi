import React from 'react'
import PropTypes from 'prop-types'

const ToggleButton = ({onChangeHandler, value}) => {

  const on = () => {
    return (
      <button type='button' className='btn btn-sm btn-outline-success col-8 col-md-12 col-lg-8' onClick={onChangeHandler}>
        <span>On</span> <small className='disabled'>Off</small>
      </button>
    )
  }

  const off = () => {
    return (
      <button type='button' className='btn btn-sm btn-outline-danger col-8 col-md-12 col-lg-8' onClick={onChangeHandler}>
        <small className='disabled'>On</small> <span>Off</span>
      </button>
    )
  }

  const classes = ['switch', (on ? 'on ' : '')].join(' ')

  return (
    <div className={classes} onClick={(e) => onChangeHandler(e)}>
      <div className="switch-toggle"></div>
    </div>
  )

}

ToggleButton.propTypes = {
  on: PropTypes.bool,
  onChangeHandler: PropTypes.func
}

export default ToggleButton
