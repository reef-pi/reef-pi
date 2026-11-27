import React from 'react'
import { Dialog } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import Calibrate from './calibrate'
import i18next from 'i18next'

// Guided pH calibration (#3301). The points keep their existing order: the midpoint first, then the
// optional second and low points. A point is "stored" only once the controller confirms it; a failed
// request leaves it retryable. The live reading is what gets paired with the buffer value, so nothing
// can be stored until the probe has reported one.
const STEPS = [
  { point: 'mid', label: 'ph:midpoint', defaultValue: '7' },
  { point: 'second', label: 'ph:second_point', defaultValue: '10' },
  { point: 'low', label: 'ph:low_point', defaultValue: '4' }
]

// The calibrate action resolves either way; only a successful request dispatches this action.
const STORED_ACTION = 'PH_PROBE_CALIBRATED'

const hasReading = value => typeof value === 'number' && Number.isFinite(value)

export default class CalibrationWizard extends React.Component {
  constructor (props) {
    super(props)
    // ready | storing | stored | failed; a point that is not unlocked yet is "locked" (derived)
    this.state = { status: { mid: 'ready', second: 'ready', low: 'ready' } }
    this.handleCalibrate = this.handleCalibrate.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
  }

  componentDidMount () {
    this.timer = setInterval(() => {
      this.props.readProbe(this.props.probe.id)
    }, 1500)
  }

  componentWillUnmount () {
    window.clearInterval(this.timer)
  }

  setStatus (point, value) {
    this.setState(state => ({ status: { ...state.status, [point]: value } }))
  }

  stepStatus (index) {
    const { point } = STEPS[index]
    if (index > 0 && this.state.status[STEPS[index - 1].point] !== 'stored') return 'locked'
    return this.state.status[point]
  }

  handleCalibrate (point, expected) {
    const observed = this.reading()
    if (!hasReading(observed)) return Promise.resolve()
    this.setStatus(point, 'storing')
    return Promise.resolve(this.props.calibrateProbe(this.props.probe.id, { type: point, expected, observed }))
      .then(result => this.setStatus(point, result && result.type === STORED_ACTION ? 'stored' : 'failed'))
      .catch(() => this.setStatus(point, 'failed'))
  }

  handleCancel () {
    this.props.cancel()
  }

  handleConfirm () {
    this.props.confirm()
  }

  reading () {
    return (this.props.currentReading || {})[this.props.probe.id]
  }

  render () {
    const reading = this.reading()
    const anyStored = Object.values(this.state.status).includes('stored')

    const actions = (
      <div className='ph-calibration-actions'>
        {!anyStored && (
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
        <div className='ph-calibration'>
          <p className='ph-calibration-intro'>
            {i18next.t('ph:calibration_intro', { defaultValue: 'Rinse the probe, place it in each buffer solution and wait for the reading to settle before storing the point. The midpoint comes first; the second and low points are optional.' })}
          </p>

          <div className='ph-calibration-reading' aria-live='polite'>
            <span className='ph-calibration-reading__label'>{i18next.t('ph:current_reading')}</span>
            {hasReading(reading)
              ? <span className='ph-calibration-reading__value'>{reading.toFixed(2)} <span className='ph-calibration-reading__unit'>pH</span></span>
              : <span className='ph-calibration-reading__waiting'>{i18next.t('ph:waiting_reading', { defaultValue: 'Waiting for a reading from the probe…' })}</span>}
          </div>

          <ol className='ph-calibration-steps'>
            {STEPS.map((step, index) => {
              const status = this.stepStatus(index)
              return (
                <li key={step.point} className='ph-calibration-step' data-calibration-step={step.point} data-status={status}>
                  <span className='ph-calibration-step__marker' aria-hidden='true'>
                    {status === 'stored' ? <CheckIcon /> : index + 1}
                  </span>
                  <Calibrate
                    point={step.point}
                    label={i18next.t(step.label) + (index > 0 ? ` (${i18next.t('ph:optional', { defaultValue: 'optional' })})` : '')}
                    defaultValue={step.defaultValue}
                    stepStatus={status}
                    readOnly={status === 'locked' || status === 'storing' || status === 'stored' || !hasReading(reading)}
                    onSubmit={this.handleCalibrate}
                  />
                </li>
              )
            })}
          </ol>
        </div>
      </Dialog>
    )
  }
}

function CheckIcon () {
  return (
    <svg width='14' height='14' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <polyline points='3.5,8.5 6.5,11.5 12.5,4.5' />
    </svg>
  )
}
