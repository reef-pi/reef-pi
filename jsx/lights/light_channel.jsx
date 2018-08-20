import React from 'react'
import ColorPicker from './color_picker'
import ProfileSelector from './profile_selector'
import Profile from './profile'
import Percent from './percent'

const Channel = (props) => {

  const handleChange = e => {
    props.onChangeHandler(e, props.channelNum)
  }

  const handleConfigChange = e => {
    console.log('handling config change', JSON.stringify(e))
    props.onChangeHandler(e, props.channelNum)
  }

  return (
    <div className="controls border-top">
      <div className="row align-items-start">
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="form-group">
            <label className="w-100">
              Name 
              <small className="float-right badge badge-info mt-1">(pin {props.channel.pin})</small>
            </label>
            <input type="text" className="form-control" 
              placeholder="Enter Channel Name"
              name="name"
              disabled={props.readOnly}
              onChange={handleChange}
              value={props.channel.name} />
          </div>
        </div>
        
        <div className="form-group col-sm-6 col-md-4 col-xl-2 form-inline">
          <label className="mb-2">Color</label>
          <ColorPicker name="color"
            readOnly={props.readOnly}
            color={props.channel.color}
            onChangeHandler={handleChange} />
        </div>

        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="form-group">
            <label>Behavior</label>
            <select className="custom-select"
              name="reverse"
              disabled={props.readOnly}
              onChange={handleChange}
              value={props.channel.reverse}>
              <option value="false">Active High</option>
              <option value="true">Active Low</option>
            </select>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="form-group">
            <label>Min</label>
            <Percent type="text" className="form-control"
              name="min" 
              disabled={props.readOnly}
              onChange={handleChange}
              value={props.channel.min} />
          </div>  
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="form-group">
            <label>Max</label>
            <Percent type="text" className="form-control"
              name="max"
              disabled={props.readOnly}
              onChange={handleChange}
              value={props.channel.max}  />
          </div>  
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="form-group">
            <label>Start</label>
            <Percent type="text" className="form-control"
              name="start_min"
              disabled={props.readOnly}
              onChange={handleChange} 
              value={props.channel.start_min} />
          </div>  
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="form-group">
            <label className="mr-3">Profile</label>
            <ProfileSelector
              name="profile.type"
              readOnly={props.readOnly}
              onChangeHandler={handleChange}
              value={props.channel.profile.type} />
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <Profile 
            name='profile.config'
            readOnly={props.readOnly}
            type={props.channel.profile.type}
            config={props.channel.profile.config} 
            onChangeHandler={handleConfigChange} />
        </div>
      </div>
    </div>
  )
}

export default Channel