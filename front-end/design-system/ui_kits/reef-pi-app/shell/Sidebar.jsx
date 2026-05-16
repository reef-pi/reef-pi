import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

/*
 * Collapsible left sidebar — visible at ≥992px only.
 * Below 992px, render nothing; BottomNav (#21) takes over.
 * Behind new_shell flag.
 *
 * Rail: 72px wide, --reefpi-gradient-brand background.
 * Expanded: 240px wide, text labels alongside icons.
 * Persists expanded/collapsed to localStorage.
 *
 * Usage:
 *   <Sidebar
 *     routes={[{ id, label, href, icon: <svg> }]}
 *     activeRoute='dashboard'
 *     onSignOut={fn}
 *   />
 */

const STORAGE_KEY  = 'reefpi.sidebar-expanded'
const RAIL_W       = 72
const EXPANDED_W   = 240

const NAV_ITEM_STYLE = (active, expanded) => ({
  display:        'flex',
  alignItems:     'center',
  gap:            '0.75rem',
  minHeight:      '44px',
  padding:        expanded ? '0 1rem' : '0',
  justifyContent: expanded ? 'flex-start' : 'center',
  borderRadius:   'var(--reefpi-radius-sm)',
  background:     active ? 'var(--reefpi-color-nav-overlay)' : 'none',
  border:         'none',
  cursor:         'pointer',
  color:          active ? 'var(--reefpi-color-nav-text-strong)' : 'var(--reefpi-color-nav-text)',
  fontFamily:     'var(--reefpi-font-app)',
  fontSize:       '0.875rem',
  fontWeight:     active ? 600 : 400,
  width:          '100%',
  textDecoration: 'none',
  transition:     'background 0.12s, color 0.12s',
  position:       'relative',
  whiteSpace:     'nowrap',
  overflow:       'hidden'
})

export default function Sidebar ({
  routes = DEFAULT_ROUTES,
  activeRoute,
  onSignOut,
  onNavigate
}) {
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
  })
  const [visible, setVisible] = useState(false)
  const [tooltip, setTooltip] = useState(null)

  // Only mount at ≥992px
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 992px)')
    const update = () => setVisible(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const toggleExpanded = useCallback(() => {
    setExpanded(e => {
      const next = !e
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch {}
      return next
    })
  }, [])

  if (!visible) return null

  const width = expanded ? EXPANDED_W : RAIL_W

  return (
    <nav
      aria-label='Main navigation'
      style={{
        position:   'fixed',
        top:        0,
        left:       0,
        bottom:     0,
        width:      `${width}px`,
        background: 'var(--reefpi-gradient-brand)',
        display:    'flex',
        flexDirection: 'column',
        zIndex:     100,
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow:   'hidden'
      }}
    >
      {/* Logo + expand toggle */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: expanded ? 'space-between' : 'center',
        minHeight:      '64px',
        padding:        expanded ? '0 1rem 0 1.25rem' : '0',
        borderBottom:   '1px solid var(--reefpi-color-nav-border)',
        flexShrink:     0
      }}>
        <a
          href='/'
          data-testid='smoke-brand'
          style={{
            color:          'var(--reefpi-color-nav-text-strong)',
            fontFamily:     'var(--reefpi-font-app)',
            fontWeight:     700,
            fontSize:       expanded ? '1.1rem' : '1rem',
            textDecoration: 'none',
            letterSpacing:  expanded ? 0 : '0.04em'
          }}
        >
          {expanded ? 'reef-pi' : 'rp'}
        </a>
        <button
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={toggleExpanded}
          style={{
            background: 'none',
            border:     'none',
            color:      'var(--reefpi-color-nav-text-muted)',
            cursor:     'pointer',
            minWidth:   '36px',
            minHeight:  '36px',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--reefpi-radius-sm)',
            flexShrink: 0
          }}
        >
          <ChevronIcon expanded={expanded} />
        </button>
      </div>

      {/* Route items */}
      <div style={{
        flex:       '1 1 auto',
        overflowY:  'auto',
        overflowX:  'hidden',
        padding:    '0.5rem',
        display:    'flex',
        flexDirection: 'column',
        gap:        '2px'
      }}>
        {routes.map(route => (
          <NavItem
            key={route.id}
            route={route}
            active={activeRoute === route.id}
            expanded={expanded}
            onNavigate={onNavigate}
            onTooltip={setTooltip}
          />
        ))}
      </div>

      {/* Sign out */}
      <div style={{ padding: '0.5rem', borderTop: '1px solid var(--reefpi-color-nav-border)', flexShrink: 0 }}>
        <button
          onClick={onSignOut}
          style={NAV_ITEM_STYLE(false, expanded)}
        >
          <SignOutIcon />
          {expanded && <span>Sign out</span>}
        </button>
      </div>

      {/* Tooltip (rail-only) */}
      {tooltip && !expanded && (
        <div
          role='tooltip'
          style={{
            position:   'fixed',
            left:       `${RAIL_W + 8}px`,
            top:        tooltip.top,
            background: 'var(--reefpi-color-text)',
            color:      'var(--reefpi-color-surface)',
            fontSize:   '0.75rem',
            padding:    '4px 8px',
            borderRadius: 'var(--reefpi-radius-sm)',
            pointerEvents: 'none',
            zIndex:     200,
            fontFamily: 'var(--reefpi-font-app)',
            whiteSpace: 'nowrap'
          }}
        >
          {tooltip.label}
        </div>
      )}
    </nav>
  )
}

function NavItem ({ route, active, expanded, onNavigate, onTooltip }) {
  const ref = useRef(null)
  return (
    <a
      ref={ref}
      href={route.href}
      data-testid={`smoke-tab-${route.id}`}
      aria-current={active ? 'page' : undefined}
      onClick={e => { if (onNavigate) { e.preventDefault(); onNavigate(route) } }}
      onMouseEnter={() => {
        if (expanded) return
        const rect = ref.current?.getBoundingClientRect()
        onTooltip?.({ label: route.label, top: (rect?.top ?? 0) + 'px' })
      }}
      onMouseLeave={() => onTooltip?.(null)}
      style={NAV_ITEM_STYLE(active, expanded)}
    >
      <span style={{ flexShrink: 0, width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {route.icon}
      </span>
      {expanded && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{route.label}</span>}
    </a>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ChevronIcon ({ expanded }) {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      {expanded
        ? <polyline points='10,4 6,8 10,12' />
        : <polyline points='6,4 10,8 6,12' />
      }
    </svg>
  )
}

function SignOutIcon () {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <path d='M7 10h9M13 7l3 3-3 3' />
      <path d='M10 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6' />
    </svg>
  )
}

// ── Default routes ────────────────────────────────────────────────────────────

function icon (path) {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <path d={path} />
    </svg>
  )
}

const DEFAULT_ROUTES = [
  { id: 'dashboard',   label: 'Dashboard',   href: '/',            icon: icon('M3 7l7-5 7 5v11H3V7z M7 18v-5h6v5') },
  { id: 'equipment',   label: 'Equipment',   href: '/equipment',   icon: icon('M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 4v4l3 2') },
  { id: 'lighting',    label: 'Lighting',    href: '/lighting',    icon: icon('M10 2v2M10 16v2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M2 10h2M16 10h2M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4M10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z') },
  { id: 'temperature', label: 'Temperature', href: '/temperature', icon: icon('M10 3v9M10 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 12V5a3 3 0 0 1 6 0v7') },
  { id: 'ato',         label: 'ATO',         href: '/ato',         icon: icon('M5 18s2-6 5-6 5 6 5 6M10 6v6') },
  { id: 'ph',          label: 'pH',          href: '/ph',          icon: icon('M3 10h14M10 3v14') },
  { id: 'timers',      label: 'Timers',      href: '/timers',      icon: icon('M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zM10 6v4l3 2') },
  { id: 'configuration', label: 'Settings',  href: '/config',      icon: icon('M10 1l1.5 3 3.3.5-2.4 2.3.6 3.2L10 8.5 7 10l.6-3.2L5.2 4.5 8.5 4z') },
  { id: 'health',      label: 'Health',      href: '/health',      icon: icon('M3 10h3l2-5 3 10 2-7 2 2h2') }
]

Sidebar.propTypes = {
  routes:      PropTypes.array,
  activeRoute: PropTypes.string,
  onSignOut:   PropTypes.func,
  onNavigate:  PropTypes.func
}
