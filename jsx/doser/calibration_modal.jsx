import React from 'react'
import $ from 'jquery'
import Modal from 'modal'
import CalibrateForm from './calibrate'

export default class CalibrationModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.confirm = this.confirm.bind(this)
    this.cancel = this.cancel.bind(this)
    this.calibrate = this.calibrate.bind(this)
  }

  confirm () {
    return this.promise.resolve()
  }

  cancel () {
    return this.promise.reject()
  }

  componentDidMount () {
    this.promise = new $.Deferred()
  }

  calibrate (duration, speed) {
    const payload = {
      duration: parseInt(duration),
      speed: parseInt(speed)
    }

    this.props.calibrateDoser(this.props.doser.id, payload)
  }

  render () {
    return (
      <Modal>
        <div className='modal-header'>
          <h4 className='modal-title'>
            Calibrate {this.props.doser.name}
          </h4>
        </div>
        <div className='modal-body'>
          <CalibrateForm onSubmit={this.calibrate} 
            speed={this.props.doser.regiment.speed} 
            duration={this.props.doser.regiment.duration}/>
        </div>
        <div className='modal-footer'>
          <div className='text-center'>
            <button role='confirm' type='button' className='btn btn-primary' ref='confirm' onClick={this.confirm}>
              Done
            </button>
          </div>
        </div>
      </Modal>
    )
  }
}
