import React from 'react'
import PropTypes from 'prop-types'

const densityPadding = {
  compact: 'var(--reefpi-space-xs)',
  roomy: 'var(--reefpi-space-md)'
}

const listStyle = {
  display: 'grid',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  border: '1px solid var(--reefpi-color-border)',
  borderRadius: 'var(--reefpi-radius-md)',
  background: 'var(--reefpi-color-surface-elevated)',
  overflow: 'hidden',
  minWidth: 0
}

const emptyStyle = {
  color: 'var(--reefpi-color-text-muted)',
  fontFamily: 'var(--reefpi-font-app)',
  fontSize: '0.875rem',
  lineHeight: 1.4,
  padding: 'var(--reefpi-space-md)',
  textAlign: 'center'
}

function itemStyle ({ density, interactive, style }) {
  return Object.assign({
    alignItems: 'center',
    background: 'var(--reefpi-color-surface-elevated)',
    borderTop: '1px solid var(--reefpi-color-border)',
    color: 'var(--reefpi-color-text)',
    display: 'grid',
    fontFamily: 'var(--reefpi-font-app)',
    gap: 'var(--reefpi-space-sm)',
    gridTemplateColumns: 'minmax(0, 1fr)',
    lineHeight: 1.4,
    minHeight: 'var(--reefpi-tap-target-min)',
    minWidth: 0,
    padding: densityPadding[density] || densityPadding.roomy,
    position: 'relative',
    textAlign: 'left',
    width: '100%'
  }, interactive ? { cursor: 'pointer' } : null, style)
}

function contentStyle ({ hasLeading, hasTrailing }) {
  if (hasLeading && hasTrailing) return { gridTemplateColumns: 'auto minmax(0, 1fr) auto' }
  if (hasLeading) return { gridTemplateColumns: 'auto minmax(0, 1fr)' }
  if (hasTrailing) return { gridTemplateColumns: 'minmax(0, 1fr) auto' }
  return null
}

export function List ({
  children,
  density = 'roomy',
  empty,
  style,
  ...props
}) {
  const items = React.Children.toArray(children).filter(Boolean)
  const mergedStyle = Object.assign({}, listStyle, style)

  if (!items.length && empty) {
    return (
      <div className='reefpi-list-empty' style={Object.assign({}, mergedStyle, emptyStyle)} {...props}>
        {empty}
      </div>
    )
  }

  return (
    <ul className='reefpi-list' style={mergedStyle} {...props}>
      {items.map((child, index) => React.isValidElement(child)
        ? React.cloneElement(child, {
          density: child.props.density || density,
          first: index === 0
        })
        : child)}
    </ul>
  )
}

export function ListItem ({
  action,
  children,
  density = 'roomy',
  first = false,
  leading,
  onClick,
  style,
  trailing,
  ...props
}) {
  const hasLeading = Boolean(leading)
  const hasTrailing = Boolean(trailing || action)
  const mergedStyle = Object.assign(
    {},
    itemStyle({ density, interactive: Boolean(onClick), style }),
    contentStyle({ hasLeading, hasTrailing }),
    first ? { borderTop: 'none' } : null
  )

  return (
    <li className='reefpi-list-item' style={mergedStyle} {...props}>
      {hasLeading && <span aria-hidden='true' style={{ display: 'inline-flex', flexShrink: 0 }}>{leading}</span>}
      <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</div>
      {hasTrailing && (
        <div style={{ alignItems: 'center', display: 'inline-flex', flexShrink: 0, gap: 'var(--reefpi-space-xs)' }}>
          {trailing}
          {action}
        </div>
      )}
    </li>
  )
}

List.propTypes = {
  children: PropTypes.node,
  density: PropTypes.oneOf(['compact', 'roomy']),
  empty: PropTypes.node,
  style: PropTypes.object
}

ListItem.propTypes = {
  action: PropTypes.node,
  children: PropTypes.node,
  density: PropTypes.oneOf(['compact', 'roomy']),
  first: PropTypes.bool,
  leading: PropTypes.node,
  onClick: PropTypes.func,
  style: PropTypes.object,
  trailing: PropTypes.node
}
