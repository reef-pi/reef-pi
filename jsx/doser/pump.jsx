import Common from '../common.jsx'
import $ from 'jquery'
import React from 'react'

export default class Pump extends Common {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.remove = this.remove.bind(this)
    this.calibrate = this.calibrate.bind(this)
    this.schedule = this.schedule.bind(this)
  }

  calibrate() {
  }

  schedule() {
  }

  remove (id) {
    this.confirm('Are you sure ?')
    .then(function () {
      this.ajaxDelete({
        url: '/api/dosers/' + this.props.data.id,
        type: 'DELETE',
        success: function (data) {
          this.fetch()
        }.bind(this)
      })
    }.bind(this))
  }


  render() {
    return(
     <div className='container'>
      <div className='col-sm-2'>
        <label className='text-secondary'>{this.props.data.name}</label>
      </div>
      <div className='col-sm-2'>
        <input type='button' id={'schedule-pump-' + this.props.data.id} onClick={this.calibrate} value='calibrate' className='btn btn-outline-primary' />
      </div>
      <div className='col-sm-2'>
        <input type='button' id={'schedule-pump-' + this.props.data.id} onClick={this.schedule} value='schedule' className='btn btn-outline-primary' />
      </div>
      <div className='col-sm-2'>
        <input type='button' id={'remove-pump-' + this.props.data.id} onClick={this.remove} value='delete' className='btn btn-outline-danger' />
      </div>
     </div>
    )
  }
}
