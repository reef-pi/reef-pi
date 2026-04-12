import React from 'react'
import $ from 'jquery'
import Modal from 'modal'
import CalibrateForm from './calibrate'
import i18n from 'utils/i18n'

export default class CalibrationModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      lastDuration: props.doser.regiment.duration || 0,
      lastSpeed: props.doser.regiment.speed || 0,
      ranCalibration: false,
      measuredVolume: ''
    }
    this.handleConfirm = this.handleConfirm.bind(this)
    this.cancel = this.cancel.bind(this)
    this.handleCalibrate = this.handleCalibrate.bind(this)
    this.handleSaveCalibration = this.handleSaveCalibration.bind(this)
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
      this.setState({ lastDuration: parseFloat(duration), lastSpeed: parseInt(speed), ranCalibration: true })
    }

    this.props.calibrateDoser(this.props.doser.id, payload)
  }

  handleSaveCalibration () {
    const vol = parseFloat(this.state.measuredVolume)
    if (!vol || vol <= 0) return
    this.props.saveCalibration(this.props.doser.id, {
      volume: vol,
      duration: this.state.lastDuration,
      speed: this.state.lastSpeed
    })
    this.setState({ ranCalibration: false, measuredVolume: '' })
  }

  render () {
    const isDCPump = this.props.doser.type !== 'stepper'
    const vps = this.props.doser.regiment.volume_per_second
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
          {isDCPump && this.state.ranCalibration && (
            <div className='form-group row mt-2'>
              <label className='col-4 col-form-label'>{i18n.t('doser:calibration:measured_volume')}</label>
              <div className='col-4'>
                <div className='input-group'>
                  <input
                    type='number'
                    className='form-control'
                    value={this.state.measuredVolume}
                    onChange={e => this.setState({ measuredVolume: e.target.value })}
                    placeholder='0.0'
                  />
                  <div className='input-group-append'>
                    <span className='input-group-text'>mL</span>
                  </div>
                </div>
              </div>
              <div className='col-4'>
                <button
                  type='button'
                  className='btn btn-sm btn-success'
                  onClick={this.handleSaveCalibration}
                  disabled={!this.state.measuredVolume || parseFloat(this.state.measuredVolume) <= 0}
                >
                  {i18n.t('doser:calibration:save_result')}
                </button>
              </div>
            </div>
          )}
          {isDCPump && vps > 0 && (
            <div className='alert alert-info mt-2 py-1'>
              {i18n.t('doser:calibration:current_rate')}: {vps.toFixed(3)} mL/s
            </div>
          )}
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
