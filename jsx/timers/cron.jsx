import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

export default class Cron extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }

  }

  render() {
    var tooltip = (<Tooltip id='day-tooltip'> Any integer between 1 to 31, representing the day of the month or other valid specification</Tooltip>)
    var instance = <OverlayTrigger overlay={tooltip}>
      <label> ? </label>
    </OverlayTrigger>
    return(
      <div className='container'>
        <div className='row'>
          <label className='col-sm-3'>Day of month</label>
          <input type='text' id='day' className='col-sm-2' />
          <label className='col-sm-1'>{instance}</label>
        </div>
        <div className='row'>
          <label className='col-sm-3'>Hour</label> <input type='text' id='hour' className='col-sm-2' />
        </div>
        <div className='row'>
          <label className='col-sm-3'>Minute</label> <input type='text' id='minute' className='col-sm-2' />
        </div>
        <div className='row'>
          <label className='col-sm-3'>Second</label> <input type='text' id='second' className='col-sm-2' />
        </div>
      </div>
    )
  }
}
