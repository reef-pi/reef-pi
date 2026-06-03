import React from 'react'
import Modal from 'modal'
import CalibrateForm from './calibrate'
import i18n from 'utils/i18n'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

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
    return this._resolve && this._resolve()
  }

  cancel () {
    return this._reject && this._reject()
  }

  componentDidMount () {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-sm)', marginTop: 'var(--reefpi-space-xs)', flexWrap: 'wrap' }}>
              <label style={{ whiteSpace: 'nowrap' }}>{i18n.t('doser:calibration:measured_volume')}</label>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--reefpi-space-xs)' }}>
                <Input
                  type='number'
                  value={this.state.measuredVolume}
                  onChange={e => this.setState({ measuredVolume: e.target.value })}
                  placeholder='0.0'
                />
                <span>mL</span>
              </div>
              <Button
                type='button'
                variant='primary'
                style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
                onClick={this.handleSaveCalibration}
                disabled={!this.state.measuredVolume || parseFloat(this.state.measuredVolume) <= 0}
              >
                {i18n.t('doser:calibration:save_result')}
              </Button>
            </div>
          )}
          {isDCPump && vps > 0 && (
            <div style={{
              background: 'var(--reefpi-color-pending-bg)',
              border: '1px solid var(--reefpi-color-border)',
              borderRadius: 'var(--reefpi-radius-sm)',
              color: 'var(--reefpi-color-text)',
              fontSize: '0.875rem',
              marginTop: 'var(--reefpi-space-xs)',
              padding: 'var(--reefpi-space-xxs) var(--reefpi-space-xs)'
            }}>
              {i18n.t('doser:calibration:current_rate')}: {vps.toFixed(3)} mL/s
            </div>
          )}
        </div>
        <div className='modal-footer'>
          <div className='text-center'>
            <Button role='confirm' type='button' variant='primary' ref={(r) => { this.confirm = r }} onClick={this.handleConfirm}>
              {i18n.t('close')}
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}
