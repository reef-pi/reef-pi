import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError, showUpdateSuccessful } from 'utils/alert'
import i18n from 'utils/i18n'
import { Field, FieldArray } from 'formik'
import StepSelector from './step_selector'
import SelectType from './select_type'
import BooleanSelect from '../ui_components/boolean_select'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  gap: 'var(--reefpi-space-md)'
}

const EditMacro = ({
  values,
  errors,
  touched,
  submitForm,
  isValid,
  onBlur,
  handleChange,
  setFieldValue,
  dirty,
  readOnly
}) => {
  const dragIndex = useRef(null)

  const handleSubmit = event => {
    event.preventDefault()

    if (dirty === false || isValid === true) {
      submitForm()
      showUpdateSuccessful()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(i18n.t('validation:error'))
    }
  }

  const nosteps = (len) => {
    if (len < 1) {
      return (
        <div style={{ color: 'var(--reefpi-color-error)', fontSize: '0.875rem', padding: 'var(--reefpi-space-sm) 0' }}>
          {i18n.t('none')}
        </div>
      )
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={formGridStyle}>
        <FormField label={i18n.t('name')} error={ShowError('name', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='name' /> : undefined}>
          <Input
            name='name'
            disabled={readOnly}
            onChange={handleChange}
            onBlur={onBlur}
            value={values.name}
            invalid={ShowError('name', touched, errors)}
          />
        </FormField>
        <FormField label={i18n.t('macro:reversible')} error={ShowError('reversible', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='reversible' /> : undefined}>
          <Field
            name='reversible'
            component={BooleanSelect}
            disabled={readOnly}
            invalid={ShowError('reversible', touched, errors)}
          >
            <option value='' className='d-none'>-- {i18n.t('select')} --</option>
            <option value='true'>{i18n.t('yes')}</option>
            <option value='false'>{i18n.t('no')}</option>
          </Field>
        </FormField>
      </div>

      <div style={{ marginTop: 'var(--reefpi-space-sm)' }}>
        <h6>{i18n.t('macro:steps')}</h6>
        <ErrorFor errors={errors} touched={touched} name='steps' />
      </div>

      <FieldArray
        name='steps'
        render={arrayHelpers => {
          return (
            <div style={{ paddingLeft: 'var(--reefpi-space-sm)' }}>
              {nosteps(values.steps.length)}
              {values.steps.map((step, index) => {
                return (
                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--reefpi-space-xs)', alignItems: 'flex-start', marginBottom: 'var(--reefpi-space-xs)', cursor: readOnly ? 'default' : 'grab' }}
                    className='macro-step'
                    name={`step-${index}`}
                    key={index}
                    draggable={!readOnly}
                    onDragStart={() => { dragIndex.current = index }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex.current !== null && dragIndex.current !== index) {
                        arrayHelpers.move(dragIndex.current, index)
                        dragIndex.current = null
                      }
                    }}
                  >
                    {!readOnly && (
                      <div style={{ display: 'flex', alignItems: 'center', paddingRight: 0 }} title={i18n.t('macro:drag_to_reorder')}>
                        <span style={{ fontSize: '1.2rem', color: 'var(--reefpi-color-text-muted)', userSelect: 'none' }}>&#8942;</span>
                      </div>
                    )}
                    <div style={{ minWidth: '10rem' }}>
                      <SelectType
                        name={`steps.${index}.type`}
                        aria-label='Step Type'
                        title='Step Type'
                        readOnly={readOnly}
                      />
                      <ErrorFor errors={errors} touched={touched} name={`steps.${index}.type`} />
                    </div>
                    <StepSelector
                      type={step.type}
                      name={`steps.${index}`}
                      errors={errors}
                      touched={touched}
                      readOnly={readOnly}
                    />

                    {!readOnly && (
                      <div style={{ marginLeft: 'auto' }}>
                        <Button
                          aria-label={i18n.t('delete')}
                          title={i18n.t('delete')}
                          name={`remove-step-${index}`}
                          type='button'
                          variant='danger'
                          onClick={() => arrayHelpers.remove(index)}
                          disabled={readOnly}
                        >
                          X
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
              {!readOnly && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type='button'
                    variant='primary'
                    onClick={() => arrayHelpers.push({ duration: '', id: '', on: '', title: '', message: '' })}
                    id='add-step'
                    data-testid='smoke-macro-add-step'
                  >
                    +
                  </Button>
                </div>
              )}
            </div>
          )
        }}
      />

      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-xxs)' }}>
          <Button
            type='submit'
            variant='primary'
            data-testid='smoke-macro-submit'
            disabled={readOnly}
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          >
            {i18n.t('save')}
          </Button>
        </div>
      )}
    </form>
  )
}

EditMacro.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditMacro
