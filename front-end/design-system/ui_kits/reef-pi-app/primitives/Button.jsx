import React from 'react'
import PropTypes from 'prop-types'

// Layout lives inline so the primitive renders correctly anywhere; colour and
// interaction states (hover / active / focus-visible / disabled) live in the
// `.reefpi-button` rules in front-end/assets/sass/style.scss, driven by the
// per-variant custom properties below. Inline colours could not express
// :hover or :active, which left every button with no pressed feedback.
const baseStyle = {
  alignItems: 'center',
  borderRadius: 'var(--reefpi-radius-sm)',
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
  userSelect: 'none'
}

const variants = {
  primary: {
    '--button-bg': 'var(--reefpi-color-brand)',
    '--button-bg-hover': 'var(--reefpi-color-brand-dark)',
    '--button-bg-active': 'color-mix(in srgb, var(--reefpi-color-brand-dark) 85%, var(--reefpi-color-text))',
    '--button-border': 'var(--reefpi-color-brand)',
    '--button-border-hover': 'var(--reefpi-color-brand-dark)',
    '--button-fg': 'var(--reefpi-color-on-brand)'
  },
  secondary: {
    '--button-bg': 'var(--reefpi-color-surface-elevated)',
    '--button-bg-hover': 'color-mix(in srgb, var(--reefpi-color-brand) 8%, var(--reefpi-color-surface-elevated))',
    '--button-bg-active': 'color-mix(in srgb, var(--reefpi-color-brand) 16%, var(--reefpi-color-surface-elevated))',
    '--button-border': 'var(--reefpi-color-border)',
    '--button-border-hover': 'var(--reefpi-color-brand)',
    '--button-fg': 'var(--reefpi-color-text)'
  },
  danger: {
    '--button-bg': 'var(--reefpi-color-error)',
    '--button-bg-hover': 'color-mix(in srgb, var(--reefpi-color-error) 85%, var(--reefpi-color-text))',
    '--button-bg-active': 'color-mix(in srgb, var(--reefpi-color-error) 70%, var(--reefpi-color-text))',
    '--button-border': 'var(--reefpi-color-error)',
    '--button-border-hover': 'color-mix(in srgb, var(--reefpi-color-error) 85%, var(--reefpi-color-text))',
    '--button-fg': 'var(--reefpi-color-on-error)'
  },
  ghost: {
    '--button-bg': 'transparent',
    '--button-bg-hover': 'color-mix(in srgb, var(--reefpi-color-text) 8%, transparent)',
    '--button-bg-active': 'color-mix(in srgb, var(--reefpi-color-text) 16%, transparent)',
    '--button-border': 'transparent',
    '--button-border-hover': 'transparent',
    '--button-fg': 'var(--reefpi-color-text)'
  }
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
    iconOnly ? { padding: 0 } : null,
    style
  )
  const classes = ['reefpi-button', 'reefpi-button--' + (variants[variant] ? variant : 'primary')]
  if (iconOnly) classes.push('reefpi-button--icon')
  if (className) classes.push(className)
  const componentProps = Object.assign({}, props, {
    className: classes.join(' '),
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
