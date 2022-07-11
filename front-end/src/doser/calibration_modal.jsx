import React from 'react'
import $ from 'jquery'
import Modal from 'modal'
import CalibrateForm from './calibrate'
import i18n from 'utils/i18n'

export default class CalibrationModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.handleConfirm = this.handleConfirm.bind(this)
    this.cancel = this.cancel.bind(this)
    this.handleCalibrate = this.handleCalibrate.bind(this)
  }

  handleConfirm () {
    return this.promise.resolve()
  }

  cancel () {
    return this.promise.reject()
  }

  componentDidMount () {
    this.promise = new $.Deferred()
  }

  handleCalibrate (duration, speed, volume) {
    let payload = {}
    if (this.props.doser.type === 'stepper') {
      payload = {
        volume: parseFloat(volume)
      }
    } else {
      payload = {
        duration: parseFloat(duration),
        speed: parseInt(speed)
      }
    }

    this.props.calibrateDoser(this.props.doser.id, payload)
  }

  render () {
    return (
      <Modal>
        <div className='modal-header'>
          <h4 className='modal-title'>
            {i18n.t('doser:calibrate')}: {this.props.doser.name}
          </h4>
        </div>
        <div className='modal-body'>
          <CalibrateForm
            onSubmit={this.handleCalibrate}
            speed={this.props.doser.regiment.speed}
            duration={this.props.doser.regiment.duration}
            volume={this.props.doser.regiment.volume}
            pumpType={this.props.doser.type}
          />
        </div>
        <div className='modal-footer'>
          <div className='text-center'>
            <button role='confirm' type='button' className='btn btn-primary' ref={(r) => { this.confirm = r }} onClick={this.handleConfirm}>
              {i18n.t('close')}
            </button>
          </div>
        </div>
      </Modal>
    )
  }
}
