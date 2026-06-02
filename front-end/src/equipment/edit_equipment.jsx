import React from 'react'
import PropTypes from 'prop-types'
import { ErrorMessage, ShowError } from '../utils/validation_helper'
import { showError, showUpdateSuccessful } from 'utils/alert'
import i18next from 'i18next'
import { FaTrashAlt, FaSave } from 'react-icons/fa'
import { SortByName } from 'utils/sort_by_name'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const formGridStyle = {
  alignItems: 'end',
  display: 'grid',
  gap: 'var(--reefpi-space-md)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  width: '100%'
}

const checkboxStyle = {
  height: '1.25rem',
  minHeight: '1.25rem',
  minWidth: '1.25rem',
  width: '1.25rem'
}

const actionStyle = {
  alignItems: 'center',
  display: 'inline-flex',
  gap: 'var(--reefpi-space-xs)'
}

const fieldError = (name, touched, errors) => ShowError(name, touched, errors) ? ErrorMessage(errors, name) : undefined

const EditEquipment = ({
  values,
  errors,
  touched,
  actionLabel,
  handleBlur,
  outlets,
  submitForm,
  onDelete,
  handleChange,
  isValid,
  dirty
}) => {
  const handleSubmit = (event) => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
      showUpdateSuccessful()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(i18next.t('validation:error'))
    }
  }

  const deleteAction = () => {
    if (values.id) {
      return (
        <Button type='button' variant='ghost' icon={<FaTrashAlt />} iconOnly aria-label='Delete equipment' onClick={onDelete} />
      )
    }
    return null
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={formGridStyle}>
        <Field label={i18next.t('name')} error={fieldError('name', touched, errors)}>
          <Input
            type='text'
            name='name'
            data-testid='smoke-equipment-name'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.name}
          />
        </Field>
        <Field label={i18next.t('outlet')} error={fieldError('outlet', touched, errors)}>
          <Select
            name='outlet'
            data-testid='smoke-equipment-outlet'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.outlet}
          >
            <option value=''>-- {i18next.t('select')} --</option>
            {outlets.slice().sort((a, b) => SortByName(a, b))
              .map((item) => {
                return (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                )
              })}
          </Select>
        </Field>
        <Field label={i18next.t('stayoffonboot')} error={fieldError('stay_off_on_boot', touched, errors)}>
          <Input
            type='checkbox'
            name='stay_off_on_boot'
            checked={values.stay_off_on_boot}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.stay_off_on_boot}
            style={checkboxStyle}
          />
        </Field>
        <Field label={i18next.t('equipment:boot_delay')} error={fieldError('boot_delay', touched, errors)}>
          <Input
            type='number'
            min='0'
            name='boot_delay'
            value={values.boot_delay}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </Field>
        <div style={actionStyle}>
          <Button type='submit' id='add_equipment' data-testid='smoke-equipment-submit' icon={<FaSave />}>
            {actionLabel}
          </Button>
          {deleteAction()}
        </div>
      </div>
    </form>
  )
}

EditEquipment.propTypes = {
  actionLabel: PropTypes.string.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  outlets: PropTypes.array,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditEquipment
