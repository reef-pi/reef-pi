import React from 'react'
import {ajaxPost} from '../utils/ajax.js'
import { DropdownButton, MenuItem } from 'react-bootstrap'

export default class Calibrate extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      type: 'high',
      value: 10
    }
    this.calibrate = this.calibrate.bind(this)
    this.setType = this.setType.bind(this)
    this.updateValue = this.updateValue.bind(this)
  }

  setType(k, ev) {
    this.setState({type: k})
  }

  updateValue(ev) {
    this.setState({
      value: ev.target.value
    })
  }

  calibrate() {
    var  payload = {
      type: this.state.type,
      value: parseFloat(this.state.value)
    }
    ajaxPost({
      url: '/api/phprobes/'+this.props.probe+'/calibrate',
      data: JSON.stringify(payload),
      success: function (data) {
      }.bind(this)
    })
  }

  render() {
    var menuItems = [
      <MenuItem key='high' eventKey='high'>High</MenuItem> ,
      <MenuItem key='mid' eventKey='mid'>Mid</MenuItem> ,
      <MenuItem key='low' eventKey='low'>Low</MenuItem> 
    ]
    return(
      <div className='container'>
        <div className='col-sm-2'>
          <DropdownButton title={this.state.type} onSelect={this.setType} id={this.props.probe+'-calibration-type'}>
            {menuItems}
          </DropdownButton>
        </div>
        <div className='col-sm-2'>
          <div className='input-group'>
            <label className='input-group-addon'>Value</label>
            <input
              type='text'
              className='form-control'
              value={this.state.value}
              onChange={this.updateValue}
              />
          </div>
         </div>
        <button className='btn btn-primary' onClick={this.calibrate}>
         Run calibration
        </button>
      </div>
    )
  }
}
