import React, { useState } from 'react'
import i18n from 'utils/i18n'
import { Dialog } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

// Dosing pump calibration (#3303). A DC pump runs at a speed for a duration; the user measures what it
// dispensed and saves that volume, from which the controller derives its mL/s rate. A stepper pump
// dispenses a volume directly. Every state shown here comes from the controller's response: a run is
// "started" only once the controller accepts it, a result is "saved" only once it is stored.
const RAN = 'DOSING_PUMP_CALIBRATED'
const SAVED = 'DOSING_PUMP_CALIBRATION_SAVED'

const t = (key, defaultValue, options = {}) => i18n.t('doser:calibration:' + key, { defaultValue, ...options })

const RUN_STATUS = {
  running: ['running', 'Starting the pump…'],
  started: ['started', 'Pump started for {{duration}} s. Measure the volume once it stops.'],
  failed: ['run_failed', 'The pump did not start. Check the pump and try again.']
}
const STEPPER_STATUS = {
  ...RUN_STATUS,
  started: ['dispensing', 'Dispensing {{volume}} mL. Check the cylinder once the pump stops.']
}
const SAVE_STATUS = {
  saving: ['saving', 'Saving…'],
  saved: ['saved', 'Saved'],
  failed: ['save_failed', 'Not saved. Check the volume and try again.']
}

const toNumber = value => (value === '' || value === undefined || value === null ? NaN : Number(value))
const initial = value => (value === undefined || value === null ? '' : String(value))

function UnitInput ({ name, unit, value, onChange, disabled, min, max }) {
  return (
    <span className='doser-calibration__input'>
      <Input
        name={name}
        type='number'
        step='any'
        inputMode='decimal'
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
      />
      <span className='doser-calibration__unit' data-unit={name} aria-hidden='true'>{unit}</span>
    </span>
  )
}

function Status ({ status, texts, id, values }) {
  const text = texts[status]
  if (!text) return null
  return (
    <p id={id} className={'doser-calibration__status doser-calibration__status--' + status} role={status === 'failed' ? 'alert' : undefined}>
      {t(text[0], text[1], values)}
    </p>
  )
}

export default function CalibrationModal ({ doser, calibrateDoser, saveCalibration, onClose }) {
  const stepper = doser.type === 'stepper'
  const regiment = doser.regiment || {}
  const [speed, setSpeed] = useState(initial(regiment.speed))
  const [duration, setDuration] = useState(initial(regiment.duration))
  const [volume, setVolume] = useState(initial(regiment.volume))
  const [measured, setMeasured] = useState('')
  const [runStatus, setRunStatus] = useState('ready')
  const [saveStatus, setSaveStatus] = useState('ready')
  // The run the measurement belongs to: the inputs may change after it.
  const [lastRun, setLastRun] = useState(null)

  const payload = stepper
    ? { volume: toNumber(volume) }
    : { speed: toNumber(speed), duration: toNumber(duration) }
  const valid = stepper
    ? payload.volume > 0
    : Number.isInteger(payload.speed) && payload.speed >= 1 && payload.speed <= 100 && payload.duration > 0
  const running = runStatus === 'running'

  const handleRun = event => {
    event.preventDefault()
    if (!valid || running) return
    setRunStatus('running')
    setSaveStatus('ready')
    Promise.resolve(calibrateDoser(doser.id, payload))
      .then(result => {
        const ok = Boolean(result) && result.type === RAN
        setRunStatus(ok ? 'started' : 'failed')
        if (ok) setLastRun(payload)
      })
      .catch(() => setRunStatus('failed'))
  }

  const measuredVolume = toNumber(measured)
  const handleSave = event => {
    event.preventDefault()
    if (!lastRun || !(measuredVolume > 0) || saveStatus === 'saving') return
    setSaveStatus('saving')
    Promise.resolve(saveCalibration(doser.id, { volume: measuredVolume, duration: lastRun.duration, speed: lastRun.speed }))
      .then(result => setSaveStatus(result && result.type === SAVED ? 'saved' : 'failed'))
      .catch(() => setSaveStatus('failed'))
  }

  const rate = regiment.volume_per_second
  const calibrated = typeof rate === 'number' && rate > 0
  const runStatusId = 'doser-calibration-run-status-' + doser.id
  const saveStatusId = 'doser-calibration-save-status-' + doser.id

  const actions = (
    <Button data-testid='smoke-doser-calibration-close' type='button' variant='secondary' onClick={onClose}>
      {i18n.t('done')}
    </Button>
  )

  return (
    <Dialog open onClose={onClose} title={`${i18n.t('doser:calibrate')} ${doser.name}`} actions={actions}>
      <div className='doser-calibration'>
        <p className='doser-calibration__intro'>
          {stepper
            ? t('intro_stepper', 'Place the pump outlet in a measuring cylinder and dispense a known volume. If the cylinder shows a different volume, adjust the pump\'s volume per rotation.')
            : t('intro', 'Place the pump outlet in a measuring cylinder, run the pump, then enter the volume it dispensed. reef-pi uses it to work out how many mL the pump doses per second.')}
        </p>

        {regiment.enable && (
          <p className='doser-calibration__notice' role='note'>
            {t('schedule_on', 'This pump\'s schedule is on, so a scheduled dose could run during the measurement. Turn the pump off first for an accurate result.')}
          </p>
        )}

        {!stepper && (
          <p className='doser-calibration__rate' data-calibrated={String(calibrated)}>
            <span className='doser-calibration__rate-label'>{i18n.t('doser:calibration:current_rate')}</span>
            {calibrated
              ? <span className='doser-calibration__rate-value'>{rate.toFixed(3)} mL/s</span>
              : <span className='doser-calibration__rate-missing'>{t('not_calibrated', 'Not calibrated yet')}</span>}
          </p>
        )}

        <ol className='doser-calibration__steps'>
          <li className='doser-calibration__step' data-calibration-step='run' data-status={runStatus}>
            <span className='doser-calibration__marker' aria-hidden='true'>1</span>
            <form className='doser-calibration__form' onSubmit={handleRun} noValidate>
              <h3 className='doser-calibration__step-title'>
                {stepper ? t('step_dispense', 'Dispense a volume') : t('step_run', 'Run the pump')}
              </h3>
              <div className='doser-calibration__fields'>
                {stepper
                  ? (
                    <FormField label={i18n.t('doser:volume')} helpText={t('volume_help', 'Volume to dispense, in mL')}>
                      <UnitInput name='volume' unit='mL' value={volume} onChange={setVolume} disabled={running} min='0' />
                    </FormField>
                    )
                  : (
                    <>
                      <FormField label={i18n.t('doser:speed')} helpText={t('speed_help', 'Percent of full speed, 1–100')}>
                        <UnitInput name='speed' unit='%' value={speed} onChange={setSpeed} disabled={running} min='1' max='100' />
                      </FormField>
                      <FormField label={i18n.t('doser:duration')} helpText={t('duration_help', 'How long the pump runs, in seconds')}>
                        <UnitInput name='duration' unit='s' value={duration} onChange={setDuration} disabled={running} min='0' />
                      </FormField>
                    </>
                    )}
              </div>
              <div className='doser-calibration__action'>
                <Button
                  data-testid='doser-calibration-run'
                  type='submit'
                  variant='primary'
                  disabled={running || !valid}
                  aria-describedby={runStatus !== 'ready' ? runStatusId : undefined}
                >
                  {i18n.t('doser:calibration:run')}
                </Button>
                <span className='doser-calibration__action-hint'>
                  {stepper
                    ? t('run_hint_stepper', 'Dispenses {{volume}} mL', { volume: valid ? payload.volume : '–' })
                    : t('run_hint', 'Runs at {{speed}} % for {{duration}} s', { speed: valid ? payload.speed : '–', duration: valid ? payload.duration : '–' })}
                </span>
              </div>
              <Status id={runStatusId} status={runStatus} texts={stepper ? STEPPER_STATUS : RUN_STATUS} values={lastRun || undefined} />
            </form>
          </li>

          {!stepper && lastRun && (
            <li className='doser-calibration__step' data-calibration-step='measure' data-status={saveStatus}>
              <span className='doser-calibration__marker' aria-hidden='true'>2</span>
              <form className='doser-calibration__form' onSubmit={handleSave} noValidate>
                <h3 className='doser-calibration__step-title'>{t('step_measure', 'Enter the measured volume')}</h3>
                <div className='doser-calibration__fields'>
                  <FormField
                    label={t('measured_volume_label', 'Measured volume')}
                    helpText={t('measured_help', 'Dispensed in {{duration}} s at {{speed}} %', { duration: lastRun.duration, speed: lastRun.speed })}
                  >
                    <UnitInput name='measured_volume' unit='mL' value={measured} onChange={value => { setMeasured(value); if (saveStatus !== 'saving') setSaveStatus('ready') }} disabled={saveStatus === 'saving'} min='0' />
                  </FormField>
                </div>
                <div className='doser-calibration__action'>
                  <Button
                    data-testid='doser-calibration-save'
                    type='submit'
                    variant='primary'
                    disabled={saveStatus === 'saving' || !(measuredVolume > 0)}
                    aria-describedby={saveStatus !== 'ready' ? saveStatusId : undefined}
                  >
                    {i18n.t('doser:calibration:save_result')}
                  </Button>
                </div>
                <Status id={saveStatusId} status={saveStatus} texts={SAVE_STATUS} />
              </form>
            </li>
          )}
        </ol>
      </div>
    </Dialog>
  )
}
