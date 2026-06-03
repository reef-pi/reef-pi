import React from 'react'
import { Dialog } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
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
      enableLow: false,
      lowCalibrated: false
    }
    this.handleCalibrate = this.handleCalibrate.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
  }

  confirm () {
    return this.promise.resolve()
  }

  cancel () {
    return this.promise.reject()
  }

  componentDidMount () {
    this.timer = setInterval(() => {
      this.props.readProbe(this.props.probe.id)
    }, 1500)
  }

  componentWillUnmount () {
    window.clearInterval(this.timer)
  }

  handleCalibrate (point, expected) {
    const payload = {
      type: point,
      expected,
      observed: this.props.currentReading[this.props.probe.id]
    }

    if (point === 'mid') {
      this.setState({ enableMid: false, enableSecond: true })
    } else if (point === 'second') {
      this.setState({ secondCalibrated: true, enableSecond: false, enableLow: true })
    } else if (point === 'low') {
      this.setState({ lowCalibrated: true, enableLow: false })
    }

    this.props.calibrateProbe(this.props.probe.id, payload).then(() => {
      if (point === 'mid') {
        this.setState({
          midCalibrated: true,
          enableMid: false,
          enableSecond: true
        })
      } else if (point === 'second') {
        this.setState({ secondCalibrated: true, enableSecond: false, enableLow: true })
      } else {
        this.setState({ lowCalibrated: true, enableLow: false })
      }
    })
  }

  handleCancel () {
    this.props.cancel()
  }

  handleConfirm () {
    this.props.confirm()
  }

  render () {
    const actions = (
      <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)' }}>
        {this.state.midCalibrated === false && (
          <Button role='abort' type='button' variant='secondary' onClick={this.handleCancel}>
            {i18next.t('cancel')}
          </Button>
        )}
        <Button role='confirm' type='button' variant='primary' onClick={this.handleConfirm}>
          {i18next.t('done')}
        </Button>
      </div>
    )

    return (
      <Dialog
        open
        onClose={this.handleCancel}
        title={`${i18next.t('ph:calibrate')} ${this.props.probe.name}`}
        actions={actions}
      >
        <Calibrate
          point='mid'
          label={i18next.t('ph:midpoint')}
          defaultValue='7'
          complete={this.state.midCalibrated}
          readOnly={!this.state.enableMid}
          onSubmit={this.handleCalibrate}
        />
        <Calibrate
          point='second'
          label={i18next.t('ph:second_point')}
          defaultValue='10'
          complete={this.state.secondCalibrated}
          readOnly={!this.state.enableSecond}
          onSubmit={this.handleCalibrate}
        />
        <Calibrate
          point='low'
          label={i18next.t('ph:low_point')}
          defaultValue='4'
          complete={this.state.lowCalibrated}
          readOnly={!this.state.enableLow}
          onSubmit={this.handleCalibrate}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--reefpi-space-md)', marginTop: 'var(--reefpi-space-sm)' }}>
          <div>{i18next.t('ph:current_reading')}</div>
          <div>{this.props.currentReading[this.props.probe.id]}</div>
        </div>
      </Dialog>
    )
  }
}
