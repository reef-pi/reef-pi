import React from 'react'

const FixedProfile = (props) => {

  const handleChange = e => {
    
    if (/^([0-9]{0,2}$)|(100)$/.test(e.target.value)){
      props.onChangeHandler(e)
    }
  }

  return (
    <div className="row form-group justify-content-center">
      <div className="col-6 col-sm-3 col-md-2 col-xl-1 order-sm-2">
        <input type="text" name="value"
          className="form-control"
          value={props.config.value}
          onChange={handleChange}
          disabled={props.readOnly} />
      </div>
      <input name="value"
        className="col-11 col-sm-8 col-md-9 col-xl-10 order-sm-1"
        type="range"
        onChange={props.onChangeHandler}
        disabled={props.readOnly}
        value={props.config.value}          
      />
    </div>
  )

}

export default FixedProfile