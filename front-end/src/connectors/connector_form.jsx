import React, { useState } from 'react'
import PropTypes from 'prop-types'
import i18n from 'utils/i18n'
import { byCapability } from './driver_filter'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

export const KIND_CONFIG = {
  outlet: { label: 'Outlet', capability: 'digital-output', multiPin: false, reverse: true },
  inlet: { label: 'Inlet', capability: 'digital-input', multiPin: false, reverse: true },
  jack: { label: 'Jack', capability: 'pwm', multiPin: true, reverse: true },
  analog: { label: 'Analog input', capability: 'analog-input', multiPin: false, reverse: false }
}

export const KIND_ORDER = ['outlet', 'inlet', 'jack', 'analog']

export const driversForKind = (drivers, kind) => (
  (drivers || []).filter(byCapability(KIND_CONFIG[kind].capability))
)

export const kindsForDriver = driver => (
  KIND_ORDER.filter(kind => byCapability(KIND_CONFIG[kind].capability)(driver || {}))
)

export const pinsForDriver = (driver, kind) => {
  const pins = ((driver && driver.pinmap) || {})[KIND_CONFIG[kind].capability] || []
  return pins.slice().sort((a, b) => a - b)
}

const defaultDriverId = (drivers, kind, preferred) => {
  const capable = driversForKind(drivers, kind)
  const match = capable.find(d => d.id === preferred) || capable.find(d => d.id === 'rpi') || capable[0]
  return match ? match.id : ''
}

export const parsePins = text => {
  const pins = String(text).split(',').map(p => p.trim()).map(p => (/^\d+$/.test(p) ? parseInt(p, 10) : NaN))
  return pins.some(isNaN) ? null : pins
}

export const buildPayload = (kind, values) => {
  const payload = { name: values.name.trim(), driver: values.driver }
  if (KIND_CONFIG[kind].multiPin) payload.pins = parsePins(values.pins)
  else payload.pin = values.pin
  if (KIND_CONFIG[kind].reverse) payload.reverse = values.reverse
  if (values.equipment) payload.equipment = values.equipment
  return payload
}

export const validate = (kind, values) => {
  const errors = {}
  if (!values.name.trim()) errors.name = i18n.t('validation:name_required', 'Name cannot be empty')
  if (!values.driver) errors.driver = i18n.t('validation:driver_required', 'Select a driver')
  if (KIND_CONFIG[kind].multiPin) {
    if (parsePins(values.pins) === null) errors.pins = i18n.t('validation:comma_separated_numbers')
  } else if (typeof values.pin !== 'number' || isNaN(values.pin)) {
    errors.pin = i18n.t('validation:pin_required', 'Select a pin')
  }
  return errors
}

const initialValues = (kind, drivers, initial) => {
  const driver = defaultDriverId(drivers, kind, initial.driver)
  const driverObj = (drivers || []).find(d => d.id === driver)
  const pins = pinsForDriver(driverObj, kind)
  return {
    name: initial.name || '',
    driver,
    pin: initial.pin !== undefined ? initial.pin : pins[0],
    pins: (initial.pins || []).join(','),
    reverse: Boolean(initial.reverse),
    equipment: initial.equipment
  }
}

const ConnectorForm = ({ mode, kind: initialKind, drivers, initial = {}, onSubmit, onCancel }) => {
  const editing = mode === 'edit'
  const [kind, setKind] = useState(initialKind)
  const [values, setValues] = useState(() => initialValues(initialKind, drivers, initial))
  const [errors, setErrors] = useState({})
  const config = KIND_CONFIG[kind]
  const driver = (drivers || []).find(d => d.id === values.driver)

  const set = patch => setValues(prev => ({ ...prev, ...patch }))

  const changeKind = e => {
    const next = e.target.value
    setKind(next)
    setErrors({})
    setValues(initialValues(next, drivers, { name: values.name, driver: values.driver }))
  }

  const changeDriver = e => {
    const next = (drivers || []).find(d => d.id === e.target.value)
    set({ driver: e.target.value, pin: pinsForDriver(next, kind)[0] })
  }

  const submit = e => {
    e.preventDefault()
    const found = validate(kind, values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSubmit(kind, buildPayload(kind, values))
  }

  return (
    <form className='connector-form' data-testid='smoke-connector-form' onSubmit={submit} noValidate>
      <div className='connector-form-grid'>
        <FormField label={i18n.t('type', 'Type')}>
          <Select
            name='kind'
            data-testid='smoke-connector-kind'
            value={kind}
            disabled={editing}
            onChange={changeKind}
          >
            {KIND_ORDER.filter(k => driversForKind(drivers, k).length > 0).map(k => (
              <option key={k} value={k}>{KIND_CONFIG[k].label}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={i18n.t('name')} error={errors.name}>
          <Input
            type='text'
            name='name'
            data-testid='smoke-connector-name'
            value={values.name}
            onChange={e => set({ name: e.target.value })}
          />
        </FormField>
        <FormField label={i18n.t('driver')} error={errors.driver}>
          <Select
            name='driver'
            data-testid='smoke-connector-driver'
            value={values.driver}
            onChange={changeDriver}
          >
            {driversForKind(drivers, kind).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </FormField>
        {config.multiPin
          ? (
            <FormField label={i18n.t('pins')} error={errors.pins} helpText={i18n.t('connectors:pins_help', 'Comma separated, e.g. 0,1')}>
              <Input
                type='text'
                name='pins'
                data-testid='smoke-connector-pins'
                value={values.pins}
                onChange={e => set({ pins: e.target.value })}
              />
            </FormField>
            )
          : (
            <FormField label={i18n.t('pin')} error={errors.pin}>
              <Select
                name='pin'
                data-testid='smoke-connector-pin'
                value={values.pin === undefined ? '' : values.pin}
                onChange={e => set({ pin: parseInt(e.target.value, 10) })}
              >
                {pinsForDriver(driver, kind).map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </FormField>
            )}
        {config.reverse && (
          <FormField label={i18n.t('reverse')}>
            <Input
              type='checkbox'
              name='reverse'
              data-testid='smoke-connector-reverse'
              checked={values.reverse}
              onChange={() => set({ reverse: !values.reverse })}
            />
          </FormField>
        )}
      </div>
      <div className='connector-form-actions'>
        <Button type='button' variant='secondary' data-testid='smoke-connector-cancel' onClick={onCancel}>
          {i18n.t('cancel', 'Cancel')}
        </Button>
        <Button type='submit' variant='primary' data-testid='smoke-connector-submit'>
          {editing ? i18n.t('save') : i18n.t('add')}
        </Button>
      </div>
    </form>
  )
}

ConnectorForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  kind: PropTypes.oneOf(KIND_ORDER).isRequired,
  drivers: PropTypes.array.isRequired,
  initial: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}

export default ConnectorForm
