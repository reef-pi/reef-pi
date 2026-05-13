import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import ToggleSwitch from '../primitives/ToggleSwitch'

/*
 * Full-width 96px horizontal-scroll equipment footer.
 * Items sorted by last-toggled desc; scroll-snap per item.
 * Behind dashboard_v2 flag.
 *
 * Usage:
 *   <EquipmentStrip items={[{id,name,state,lastToggledAt,onSince}]} onToggle={(id,next)=>{}} />
 */

function formatOnSince (ts) {
  if (!ts) return null
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)   return `on ${s}s`
  if (s < 3600) return `on ${Math.floor(s / 60)}m`
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return m ? `on ${h}h ${m}m` : `on ${h}h`
}

export default function EquipmentStrip ({ items = [], onToggle }) {
  const listRef = useRef(null)

  const sorted = [...items].sort((a, b) => (b.lastToggledAt ?? 0) - (a.lastToggledAt ?? 0))

  const stepFocus = delta => {
    const el = listRef.current
    if (!el) return
    const focusable = Array.from(el.querySelectorAll('[data-equip-item]'))
    const cur = focusable.findIndex(n => n === document.activeElement || n.contains(document.activeElement))
    const next = focusable[Math.max(0, Math.min(cur + delta, focusable.length - 1))]
    next?.focus()
    next?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
  }

  const handleKeyDown = e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); stepFocus(1) }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); stepFocus(-1) }
  }

  if (sorted.length === 0) {
    return (
      <div style={stripStyle}>
        <span style={{
          fontSize: '0.8rem', color: 'var(--reefpi-color-text-muted)',
          fontFamily: 'var(--reefpi-font-app)', padding: '0 1rem'
        }}>
          No equipment configured
        </span>
      </div>
    )
  }

  return (
    <div
      ref={listRef}
      role='list'
      aria-label='Equipment'
      onKeyDown={handleKeyDown}
      style={stripStyle}
    >
      {sorted.map((item, i) => (
        <EquipmentItem
          key={item.id}
          item={item}
          isLast={i === sorted.length - 1}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

function EquipmentItem ({ item, isLast, onToggle }) {
  const onSince = item.state === 'on' || item.state === 'pending'
    ? formatOnSince(item.onSince)
    : null

  return (
    <div
      role='listitem'
      tabIndex={0}
      data-equip-item
      style={{
        scrollSnapAlign: 'start',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        padding: '0 1.25rem',
        height: '100%',
        borderRight: isLast ? 'none' : '1px solid var(--reefpi-color-border)',
        outline: 'none',
        minWidth: '108px'
      }}
    >
      <ToggleSwitch
        state={item.state ?? 'off'}
        onRequestChange={next => onToggle?.(item.id, next)}
        onRetry={() => onToggle?.(item.id, 'on')}
        errorMessage={item.errorMessage}
      />
      <a
        href={`/equipment?edit=${item.id}`}
        style={{
          fontSize: '0.78rem',
          fontWeight: 500,
          color: 'var(--reefpi-color-text)',
          fontFamily: 'var(--reefpi-font-app)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '96px',
          textAlign: 'center'
        }}
        title={item.name}
      >
        {item.name}
      </a>
      <span style={{
        fontSize: '0.68rem',
        color: 'var(--reefpi-color-text-muted)',
        fontFamily: 'var(--reefpi-font-mono)',
        height: '11px',
        lineHeight: '11px'
      }}>
        {onSince ?? ''}
      </span>
    </div>
  )
}

const stripStyle = {
  width: '100%',
  height: '96px',
  overflowX: 'auto',
  overflowY: 'hidden',
  display: 'flex',
  flexDirection: 'row',
  scrollSnapType: 'x mandatory',
  background: 'var(--reefpi-color-surface-elevated)',
  border: '1px solid var(--reefpi-color-border)',
  borderRadius: 'var(--reefpi-radius-md)',
  fontFamily: 'var(--reefpi-font-app)'
}

EquipmentStrip.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    state: PropTypes.oneOf(['off', 'on', 'pending', 'error']),
    lastToggledAt: PropTypes.number,
    onSince: PropTypes.number,
    errorMessage: PropTypes.string
  })),
  onToggle: PropTypes.func
}
