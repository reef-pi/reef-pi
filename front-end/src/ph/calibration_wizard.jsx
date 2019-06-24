import React from 'react'
import $ from 'jquery'
import Modal from 'modal'
import Calibrate from './calibrate'
import i18next from 'i18next'

export default class CalibrationWizard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      enableMid: true,
      midCalibrated: false,
      enableSecond: false,
      secondCalibrated: false,
      reading: null
    }
    this.confirm = this.confirm.bind(this)
    this.cancel = this.cancel.bind(this)
    this.calibrate = this.calibrate.bind(this)
    this.readProbe = this.readProbe.bind(this)
  }

  confirm () {
    return this.promise.resolve()
  }

  cancel () {
    return this.promise.reject()
  }

  componentDidMount () {
    this.promise = new $.Deferred()
    this.timer = setInterval(() => {
      this.readProbe()
    }, 500)
  }

  componentWillUnmount () {
    window.clearInterval(this.timer)
  }

  readProbe () {
    let id = this.props.probe.id
    let that = this

    fetch('/api/phprobes/' + id + '/read', {
      method: 'GET',
      credentials: 'same-origin'
    })
      .then(r => r.json())
      .then(r => {
        that.setState({ reading: r })
      }).catch(() => {
        that.setState({ reading: null })
      })
  }

  calibrate (point, expected) {
    const payload = {
      type: point,
      expected: expected,
      observed: this.state.reading
    }

    if (point === 'mid') {
      this.setState({ enableMid: false, enableSecond: true })
    } else if (point === 'second') {
      this.setState({secondCalibrated: true, enableSecond: false})
    }

    this.props.calibrateProbe(this.props.probe.id, payload).then(() => {
      if (point === 'mid') {
        this.setState({
          midCalibrated: true,
          enableMid: false,
          enableSecond: true
        })
      } else {
        this.setState({secondCalibrated: true, enableSecond: false})
      }
    })
  }

  render () {
    let cancelButton = null
    if (this.state.midCalibrated === false) {
      cancelButton = (
        <button role='abort' type='button' className='btn btn-light mr-2' onClick={this.cancel}>
          {i18next.t('cancel')}
        </button>
      )
    }

    return (
      <Modal>
        <div className='modal-header'>
          <h4 className='modal-title'>
            {i18next.t('ph:calibrate')} {this.props.probe.name}
          </h4>
        </div>
        <div className='modal-body'>
          <Calibrate point='mid'
            label={i18next.t('ph:midpoint')}
            defaultValue='7'
            complete={this.state.midCalibrated}
            readOnly={!this.state.enableMid}
            onSubmit={this.calibrate} />
          <Calibrate point='second'
            label={i18next.t('ph:second_point')}
            defaultValue='10'
            complete={this.state.secondCalibrated}
            readOnly={!this.state.enableSecond}
            onSubmit={this.calibrate} />
          <div className='row'>
            <div className='col-4'>{i18next.t('ph:current_reading')}</div>
            <div className='col-4'>{this.state.reading}</div>
          </div>
        </div>
        <div className='modal-footer'>
          <div className='text-center'>
            {cancelButton}
            <button role='confirm' type='button' className='btn btn-primary' ref='confirm' onClick={this.confirm}>
              {i18next.t('done')}
            </button>
          </div>
        </div>
      </Modal>
    )
  }
}
