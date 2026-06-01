import React, { cloneElement, isValidElement, useId } from 'react'
import PropTypes from 'prop-types'

const fieldStyle = {
  display: 'grid',
  gap: 'var(--reefpi-space-xxs)',
  minWidth: 0,
  fontFamily: 'var(--reefpi-font-app)'
}

const labelStyle = {
  color: 'var(--reefpi-color-text)',
  fontSize: '0.875rem',
  fontWeight: 600,
  lineHeight: 1.35
}

const requiredStyle = {
  color: 'var(--reefpi-color-error)',
  marginLeft: '0.25rem'
}

const hintStyle = {
  color: 'var(--reefpi-color-text-muted)',
  fontSize: '0.75rem',
  lineHeight: 1.35
}

const errorStyle = {
  color: 'var(--reefpi-color-error)',
  fontSize: '0.75rem',
  lineHeight: 1.35,
  fontWeight: 500
}

const controlBaseStyle = {
  width: '100%',
  minHeight: 'var(--reefpi-tap-target-min)',
  border: '1px solid var(--reefpi-color-border)',
  borderRadius: 'var(--reefpi-radius-sm)',
  background: 'var(--reefpi-color-surface-elevated)',
  color: 'var(--reefpi-color-text)',
  fontFamily: 'var(--reefpi-font-app)',
  fontSize: '1rem',
  lineHeight: 1.4,
  padding: '0 var(--reefpi-space-sm)',
  transition: 'border-color 0.12s, background-color 0.12s',
  boxShadow: 'none'
}

function describedBy (ids) {
  return ids.filter(Boolean).join(' ') || undefined
}

function controlStyle ({ invalid, disabled, readOnly, style }) {
  return Object.assign({}, controlBaseStyle, {
    borderColor: invalid ? 'var(--reefpi-color-error)' : 'var(--reefpi-color-border)',
    background: disabled || readOnly ? 'var(--reefpi-color-pending-bg)' : 'var(--reefpi-color-surface-elevated)',
    cursor: disabled ? 'not-allowed' : 'auto'
  }, style)
}

export function Field ({
  id,
  label,
  helpText,
  error,
  required = false,
  children
}) {
  const generatedId = useId()
  const controlId = id || 'reefpi-field-' + generatedId.replace(/:/g, '')
  const helpId = helpText ? controlId + '-help' : undefined
  const errorId = error ? controlId + '-error' : undefined
  const childDescribedBy = describedBy([helpId, errorId])
  const invalid = Boolean(error)

  const control = isValidElement(children)
    ? cloneElement(children, {
      id: children.props.id || controlId,
      'aria-describedby': describedBy([children.props['aria-describedby'], childDescribedBy]),
      'aria-invalid': invalid || children.props['aria-invalid'] || undefined,
      required: required || children.props.required || undefined,
      invalid: invalid || children.props.invalid || undefined
    })
    : children

  return (
    <div className='reefpi-field' style={fieldStyle}>
      {label && (
        <label htmlFor={controlId} style={labelStyle}>
          {label}
          {required && <span aria-hidden='true' style={requiredStyle}>*</span>}
        </label>
      )}
      {control}
      {helpText && <div id={helpId} style={hintStyle}>{helpText}</div>}
      {error && <div id={errorId} role='alert' style={errorStyle}>{error}</div>}
    </div>
  )
}

export const Input = React.forwardRef(function Input ({
  invalid = false,
  disabled = false,
  readOnly = false,
  style,
  type = 'text',
  ...props
}, ref) {
  return (
    <input
      ref={ref}
      type={type}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={invalid || undefined}
      style={controlStyle({ invalid, disabled, readOnly, style })}
      {...props}
    />
  )
})

export const Select = React.forwardRef(function Select ({
  invalid = false,
  disabled = false,
  readOnly = false,
  style,
  options = [],
  children,
  ...props
}, ref) {
  const renderedOptions = children || options.map(option => {
    if (typeof option === 'string') {
      return <option key={option} value={option}>{option}</option>
    }
    return <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
  })

  return (
    <select
      ref={ref}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      style={controlStyle({ invalid, disabled, readOnly, style })}
      {...props}
    >
      {renderedOptions}
    </select>
  )
})

Field.propTypes = {
  id: PropTypes.string,
  label: PropTypes.node,
  helpText: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  children: PropTypes.node
}

Input.propTypes = {
  invalid: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  style: PropTypes.object,
  type: PropTypes.string
}

Select.propTypes = {
  invalid: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  style: PropTypes.object,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      disabled: PropTypes.bool
    })
  ])),
  children: PropTypes.node
}
