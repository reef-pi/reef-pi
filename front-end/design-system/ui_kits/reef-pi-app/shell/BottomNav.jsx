import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

/*
 * Mobile/tablet navigation — complements Sidebar (#20).
 *
 * <768px  : fixed 56px bottom bar, 5 primary tabs + "More" tab.
 * 768–991px: hamburger in top-left; same full-height drawer.
 * ≥992px  : renders nothing (Sidebar takes over).
 *
 * "More" / hamburger opens a full-height left drawer with remaining
 * routes + Sign out. Drawer closes on route change.
 *
 * Behind new_shell flag.
 *
 * Usage:
 *   <BottomNav
 *     primaryRoutes={[{ id, label, icon }]}    // max 4 shown (+ More)
 *     allRoutes={[...]}
 *     activeRoute='dashboard'
 *     onNavigate={route => {}}
 *     onSignOut={fn}
 *   />
 */

const BOTTOM_H   = 56
const DRAWER_W   = 280

export default function BottomNav ({
  primaryRoutes = PRIMARY_ROUTES,
  allRoutes     = ALL_ROUTES,
  activeRoute,
  onNavigate,
  onSignOut
}) {
  const [mode, setMode]         = useState(null)  // 'mobile' | 'tablet' | null
  const [drawerOpen, setDrawer] = useState(false)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 768)        setMode('mobile')
      else if (w < 992)   setMode('tablet')
      else                setMode(null)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const navigate = useCallback(route => {
    setDrawer(false)
    onNavigate?.(route)
  }, [onNavigate])

  useEffect(() => {
    if (!drawerOpen) return
    const close = e => { if (e.key === 'Escape') setDrawer(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [drawerOpen])

  if (!mode) return null

  const overflowRoutes = allRoutes.filter(r => !primaryRoutes.find(p => p.id === r.id))

  return (
    <>
      {/* ── Tablet hamburger ────────────────────── */}
      {mode === 'tablet' && (
        <button
          aria-label='Open navigation'
          aria-expanded={drawerOpen}
          onClick={() => setDrawer(true)}
          style={{
            position:   'fixed',
            top:        '12px',
            left:       '12px',
            zIndex:     150,
            background: 'var(--reefpi-gradient-brand)',
            border:     'none',
            borderRadius: 'var(--reefpi-radius-sm)',
            color:      'var(--reefpi-color-nav-text-strong)',
            minWidth:   '44px',
            minHeight:  '44px',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor:     'pointer'
          }}
        >
          <HamburgerIcon />
        </button>
      )}

      {/* ── Mobile bottom bar ────────────────────── */}
      {mode === 'mobile' && (
        <nav
          aria-label='Main navigation'
          style={{
            position:   'fixed',
            bottom:     0,
            left:       0,
            right:      0,
            height:     `${BOTTOM_H}px`,
            paddingBottom: 'env(safe-area-inset-bottom)',
            background: 'var(--reefpi-gradient-brand)',
            display:    'flex',
            alignItems: 'stretch',
            zIndex:     150,
            borderTop:  '1px solid var(--reefpi-color-nav-border)'
          }}
        >
          {primaryRoutes.slice(0, 4).map(route => (
            <BottomTab
              key={route.id}
              route={route}
              active={activeRoute === route.id}
              onPress={() => navigate(route)}
            />
          ))}
          {/* More tab */}
          <button
            aria-label='More routes'
            onClick={() => setDrawer(true)}
            style={{
              ...TAB_STYLE,
              color: 'var(--reefpi-color-nav-text-muted)'
            }}
          >
            <MoreIcon />
            <span style={LABEL_STYLE}>More</span>
          </button>
        </nav>
      )}

      {/* ── Drawer (both modes) ──────────────────── */}
      {drawerOpen && (
        <>
          <div
            aria-hidden='true'
            onClick={() => setDrawer(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 160
            }}
          />
          <nav
            aria-label='Navigation drawer'
            style={{
              position:   'fixed',
              top:        0,
              left:       0,
              bottom:     0,
              width:      `${DRAWER_W}px`,
              background: 'var(--reefpi-gradient-brand)',
              zIndex:     170,
              display:    'flex',
              flexDirection: 'column',
              transform:  'translateX(0)',
              transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)'
            }}
          >
            {/* Drawer header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              minHeight: '64px', padding: '0 1rem',
              borderBottom: '1px solid var(--reefpi-color-nav-border)',
              flexShrink: 0
            }}>
              <span style={{
                color: 'var(--reefpi-color-nav-text-strong)',
                fontFamily: 'var(--reefpi-font-app)',
                fontWeight: 700, fontSize: '1.1rem'
              }}>
                reef-pi
              </span>
              <button
                aria-label='Close navigation'
                onClick={() => setDrawer(false)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--reefpi-color-nav-text-muted)',
                  minWidth: '44px', minHeight: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', borderRadius: 'var(--reefpi-radius-sm)'
                }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* All routes */}
            <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '0.5rem' }}>
              {allRoutes.map(route => (
                <DrawerItem
                  key={route.id}
                  route={route}
                  active={activeRoute === route.id}
                  onPress={() => navigate(route)}
                />
              ))}
            </div>

            {/* Sign out */}
            <div style={{ padding: '0.5rem', borderTop: '1px solid var(--reefpi-color-nav-border)', flexShrink: 0 }}>
              <button
                onClick={() => { setDrawer(false); onSignOut?.() }}
                style={DRAWER_ITEM_STYLE(false)}
              >
                <SignOutIcon />
                <span>Sign out</span>
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BottomTab ({ route, active, onPress }) {
  return (
    <button
      aria-label={route.label}
      aria-current={active ? 'page' : undefined}
      onClick={onPress}
      style={{
        ...TAB_STYLE,
        color: active ? 'var(--reefpi-color-nav-text-strong)' : 'var(--reefpi-color-nav-text-muted)',
        fontWeight: active ? 600 : 400
      }}
    >
      {route.icon}
      <span style={LABEL_STYLE}>{route.label}</span>
    </button>
  )
}

function DrawerItem ({ route, active, onPress }) {
  return (
    <button onClick={onPress} style={DRAWER_ITEM_STYLE(active)}>
      <span style={{ flexShrink: 0, width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {route.icon}
      </span>
      <span>{route.label}</span>
    </button>
  )
}

const TAB_STYLE = {
  flex: '1 1 0',
  background: 'none',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2px',
  cursor: 'pointer',
  fontFamily: 'var(--reefpi-font-app)',
  padding: '4px 0'
}

const LABEL_STYLE = {
  fontSize: '0.6rem',
  letterSpacing: '0.01em',
  lineHeight: 1
}

const DRAWER_ITEM_STYLE = active => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  minHeight: '44px',
  width: '100%',
  padding: '0 1rem',
  borderRadius: 'var(--reefpi-radius-sm)',
  background: active ? 'var(--reefpi-color-nav-overlay)' : 'none',
  border: 'none',
  color: active ? 'var(--reefpi-color-nav-text-strong)' : 'var(--reefpi-color-nav-text)',
  fontFamily: 'var(--reefpi-font-app)',
  fontSize: '0.875rem',
  fontWeight: active ? 600 : 400,
  cursor: 'pointer',
  textAlign: 'left'
})

// ── Icons ─────────────────────────────────────────────────────────────────────

const navIcon = d => (
  <svg width='20' height='20' viewBox='0 0 20 20' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <path d={d} />
  </svg>
)

function HamburgerIcon () {
  return <svg width='18' height='18' viewBox='0 0 18 18' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' aria-hidden='true'>
    <line x1='2' y1='4' x2='16' y2='4' /><line x1='2' y1='9' x2='16' y2='9' /><line x1='2' y1='14' x2='16' y2='14' />
  </svg>
}
function MoreIcon () {
  return <svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
    <circle cx='4' cy='10' r='1.5' /><circle cx='10' cy='10' r='1.5' /><circle cx='16' cy='10' r='1.5' />
  </svg>
}
function CloseIcon () {
  return <svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' aria-hidden='true'>
    <line x1='3' y1='3' x2='13' y2='13' /><line x1='13' y1='3' x2='3' y2='13' />
  </svg>
}
function SignOutIcon () {
  return navIcon('M7 10h9M13 7l3 3-3 3M10 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6')
}

// ── Default routes ────────────────────────────────────────────────────────────

const PRIMARY_ROUTES = [
  { id: 'dashboard',   label: 'Dashboard',   icon: navIcon('M3 7l7-5 7 5v11H3V7z M7 18v-5h6v5') },
  { id: 'equipment',   label: 'Equipment',   icon: navIcon('M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 4v4l3 2') },
  { id: 'lighting',    label: 'Lighting',    icon: navIcon('M10 2v2M10 16v2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M2 10h2M16 10h2M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4M10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z') },
  { id: 'temperature', label: 'Temp',        icon: navIcon('M10 3v9M10 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 12V5a3 3 0 0 1 6 0v7') }
]

const ALL_ROUTES = [
  ...PRIMARY_ROUTES,
  { id: 'ato',           label: 'ATO',      icon: navIcon('M5 18s2-6 5-6 5 6 5 6M10 6v6') },
  { id: 'ph',            label: 'pH',       icon: navIcon('M3 10h14M10 3v14') },
  { id: 'timers',        label: 'Timers',   icon: navIcon('M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zM10 6v4l3 2') },
  { id: 'configuration', label: 'Settings', icon: navIcon('M10 1l1.5 3 3.3.5-2.4 2.3.6 3.2L10 8.5 7 10l.6-3.2L5.2 4.5 8.5 4z') },
  { id: 'health',        label: 'Health',   icon: navIcon('M3 10h3l2-5 3 10 2-7 2 2h2') }
]

BottomNav.propTypes = {
  primaryRoutes: PropTypes.array,
  allRoutes:     PropTypes.array,
  activeRoute:   PropTypes.string,
  onNavigate:    PropTypes.func,
  onSignOut:     PropTypes.func
}
