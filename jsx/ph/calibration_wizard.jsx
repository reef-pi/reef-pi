import React from 'react'
import $ from 'jquery'
import Modal from 'modal'
import Calibrate from './calibrate'

export default class CalibrationWizard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      enableMid: true,
      midCalibrated: false,
      enableLow: false,
      lowCalibrated: false,
      enableHigh: false,
      highCalibrated: false
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

  calibrate (point, value) {
    const payload = {
      type: point,
      value: value
    }

    if (point === 'mid') {
      this.setState({ enableMid: false })
    } else if (point === 'low') {
      this.setState({lowCalibrated: true, enableLow: false})
    } else {
      this.setState({highCalibrated: true, enableHigh: false})
    }

    this.props.calibrateProbe(this.props.probe.id, payload).then(() => {
      if (point === 'mid') {
        this.setState({
          midCalibrated: true,
          enableMid: false,
          enableLow: true,
          enableHigh: true
        })
      } else if (point === 'low') {
        this.setState({lowCalibrated: true, enableLow: false})
      } else {
        this.setState({highCalibrated: true, enableHigh: false})
      }
    })
  }

  render () {
    let cancelButton = null
    if (this.state.midCalibrated === false) {
      cancelButton = (
        <button role='abort' type='button' className='btn btn-light mr-2' onClick={this.cancel}>
          Cancel
        </button>
      )
    }

    return (
      <Modal>
        <div className='modal-header'>
          <h4 className='modal-title'>
            Calibrate {this.props.probe.name}
          </h4>
        </div>
        <div className='modal-body'>
          <Calibrate point='mid'
            label='Midpoint'
            defaultValue='7'
            complete={this.state.midCalibrated}
            readOnly={!this.state.enableMid}
            onSubmit={this.calibrate} />
          <Calibrate point='low'
            label='Low'
            defaultValue='4'
            complete={this.state.lowCalibrated}
            readOnly={!this.state.enableLow}
            onSubmit={this.calibrate} />
          <Calibrate point='high'
            label='High'
            defaultValue='10'
            complete={this.state.highCalibrated}
            readOnly={!this.state.enableHigh}
            onSubmit={this.calibrate} />
        </div>
        <div className='modal-footer'>
          <div className='text-center'>
            {cancelButton}
            <button role='confirm' type='button' className='btn btn-primary' ref='confirm' onClick={this.confirm}>
              Done
            </button>
          </div>
        </div>
      </Modal>
    )
  }
}
