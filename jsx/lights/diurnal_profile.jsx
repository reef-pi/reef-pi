import React from 'react'

const DiurnalProfile = (props) => {

  if (!props.config){
    props.config = {
      start: '',
      end: ''
    }
  }

  return (
    <div className='form-inline row align-items-start'>
      <div className='form-group col-lg-4'>
        <label className='col-form-label col-sm-5'>Start Time</label>
        <input
          type='text'
          name='start'
          readOnly={props.readOnly}
          className='form-control col-lg-6'
          value={props.config.start}
          onChange={props.onChangeHandler}
        />
      </div>
      <div className='form-group col-lg-5'>
        <label className='col-form-label col-sm-5'>End Time</label>
        <input type='text' name='end' required
          className='form-control col-lg-6'
          readOnly={props.readOnly}
          value={props.config.end}
          onChange={props.onChangeHandler}
        />
      </div>
    </div>
  )
}

DiurnalProfile.defaultProps = {
  config: {
    start: '',
    end: ''
  }
}

export default DiurnalProfile