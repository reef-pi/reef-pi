import React from 'react'
import PropTypes from 'prop-types'

const baseStyle = {
  alignItems: 'center',
  border: '1px solid transparent',
  borderRadius: 'var(--reefpi-radius-sm)',
  boxShadow: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  fontFamily: 'var(--reefpi-font-app)',
  fontSize: '0.9375rem',
  fontWeight: 600,
  gap: 'var(--reefpi-space-xs)',
  justifyContent: 'center',
  lineHeight: 1.2,
  minHeight: 'var(--reefpi-tap-target-min)',
  minWidth: 'var(--reefpi-tap-target-min)',
  padding: '0 var(--reefpi-space-md)',
  textAlign: 'center',
  textDecoration: 'none',
  transition: 'background-color 0.12s, border-color 0.12s, color 0.12s',
  userSelect: 'none'
}

const variants = {
  primary: {
    background: 'var(--reefpi-color-brand)',
    borderColor: 'var(--reefpi-color-brand)',
    color: 'var(--reefpi-color-nav-text-strong)'
  },
  secondary: {
    background: 'var(--reefpi-color-surface-elevated)',
    borderColor: 'var(--reefpi-color-border)',
    color: 'var(--reefpi-color-text)'
  },
  danger: {
    background: 'var(--reefpi-color-error)',
    borderColor: 'var(--reefpi-color-error)',
    color: 'var(--reefpi-color-nav-text-strong)'
  },
  ghost: {
    background: 'transparent',
    borderColor: 'transparent',
    color: 'var(--reefpi-color-text)'
  }
}

const disabledStyle = {
  cursor: 'not-allowed',
  opacity: 0.58
}

const Button = React.forwardRef(function Button ({
  as: Component = 'button',
  children,
  className,
  disabled = false,
  icon,
  iconOnly = false,
  style,
  type = 'button',
  variant = 'primary',
  ...props
}, ref) {
  const mergedStyle = Object.assign(
    {},
    baseStyle,
    variants[variant] || variants.primary,
    disabled ? disabledStyle : null,
    iconOnly ? { padding: 0 } : null,
    style
  )
  const componentProps = Object.assign({}, props, {
    className,
    ref,
    style: mergedStyle
  })

  if (Component === 'button') {
    componentProps.type = type
    componentProps.disabled = disabled
  } else if (disabled) {
    componentProps['aria-disabled'] = true
    componentProps.tabIndex = -1
  }

  return (
    <Component {...componentProps}>
      {icon && <span aria-hidden='true' style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      {!iconOnly && children}
    </Component>
  )
})

Button.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  iconOnly: PropTypes.bool,
  style: PropTypes.object,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost'])
}

export default Button
