import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { NAV_ICONS } from './navIcons'
import { DEFAULT_GROUPS, groupRoutes } from './Sidebar'

/*
 * Phone and tablet navigation — complements Sidebar. Aquatic Precision (#3289): neutral
 * panels, teal for the current route.
 *
 * <768px   : fixed bottom bar, 4 primary routes + "More".
 * 768–991px: a menu button at the top left.
 * ≥992px   : renders nothing (Sidebar takes over).
 *
 * "More" / the menu button opens a drawer with every route in the same Observe / Operate /
 * Configure groups as the sidebar, the controller status, and Sign out. The drawer closes
 * on navigation, Escape, the close button or the backdrop.
 */

const DEFAULT_LABELS = {
  nav: 'Main navigation',
  drawer: 'Navigation drawer',
  open: 'Open navigation',
  close: 'Close navigation',
  more: 'More',
  moreRoutes: 'More routes',
  signOut: 'Sign out'
}

export default function BottomNav ({
  primaryRoutes = PRIMARY_ROUTES,
  allRoutes = ALL_ROUTES,
  groups = DEFAULT_GROUPS,
  labels = {},
  activeRoute,
  onNavigate,
  onSignOut,
  footer
}) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const [mode, setMode] = useState(null) // 'mobile' | 'tablet' | null
  const [drawerOpen, setDrawer] = useState(false)
  const drawerRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 768) setMode('mobile')
      else if (w < 992) setMode('tablet')
      else {
        setMode(null)
        setDrawer(false)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const closeDrawer = useCallback(() => setDrawer(false), [])

  const navigate = useCallback(route => {
    closeDrawer()
    onNavigate?.(route)
  }, [closeDrawer, onNavigate])

  useEffect(() => {
    if (!drawerOpen) return
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Move focus into the drawer (not onto a control, which would light up a ring after a tap).
    drawerRef.current?.focus()
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeDrawer()
        return
      }
      if (e.key !== 'Tab') return

      const controls = [...drawerRef.current.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      if (!controls.length) return
      const first = controls[0]
      const last = controls.at(-1)
      if (e.shiftKey && (document.activeElement === first || document.activeElement === drawerRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === drawerRef.current)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      const focusTarget = previousFocus?.isConnected ? previousFocus : triggerRef.current
      focusTarget?.focus()
    }
  }, [closeDrawer, drawerOpen])

  if (!mode) return null

  return (
    <>
      {mode === 'tablet' && (
        <button
          type='button'
          className='reefpi-menu-button'
          aria-label={l.open}
          data-testid='smoke-nav'
          aria-expanded={drawerOpen}
          ref={triggerRef}
          onClick={() => setDrawer(true)}
        >
          <HamburgerIcon />
        </button>
      )}

      {mode === 'mobile' && (
        <nav aria-label={l.nav} data-testid='smoke-nav' className='reefpi-bottom-nav'>
          {primaryRoutes.slice(0, 4).map(route => (
            <button
              type='button'
              key={route.id}
              aria-label={route.label}
              data-testid={`smoke-tab-${route.id}`}
              aria-current={activeRoute === route.id ? 'page' : undefined}
              className='reefpi-bottom-tab'
              onClick={() => navigate(route)}
            >
              {route.icon}
              <span className='reefpi-bottom-tab-label'>{route.label}</span>
            </button>
          ))}
          <button
            type='button'
            aria-label={l.moreRoutes}
            aria-expanded={drawerOpen}
            ref={triggerRef}
            className='reefpi-bottom-tab'
            onClick={() => setDrawer(true)}
          >
            <MoreIcon />
            <span className='reefpi-bottom-tab-label'>{l.more}</span>
          </button>
        </nav>
      )}

      {drawerOpen && (
        <>
          <div aria-hidden='true' className='reefpi-drawer-backdrop' onClick={closeDrawer} />
          <aside role='dialog' aria-modal='true' aria-label={l.drawer} data-testid='smoke-nav' className='reefpi-drawer' ref={drawerRef} tabIndex={-1}>
            <div className='reefpi-drawer-head'>
              <span data-testid='smoke-brand' className='reefpi-brand'>
                <span className='reefpi-brand-mark' aria-hidden='true'>rp</span>
                <span className='reefpi-brand-name'>reef-pi</span>
              </span>
              <button
                type='button'
                aria-label={l.close}
                className='reefpi-sidebar-toggle'
                onClick={closeDrawer}
              >
                <CloseIcon />
              </button>
            </div>

            <nav aria-label={l.nav} className='reefpi-sidebar-body'>
              {groupRoutes(allRoutes, groups).map(group => (
                <div key={group.id} className='reefpi-nav-group' role='group' aria-label={group.label || undefined}>
                  {group.label && <p className='reefpi-nav-group-label' aria-hidden='true'>{group.label}</p>}
                  <ul className='reefpi-nav-list'>
                    {group.routes.map(route => (
                      <li key={route.id}>
                        <button
                          type='button'
                          data-testid={`smoke-tab-${route.id}`}
                          aria-current={activeRoute === route.id ? 'page' : undefined}
                          className='reefpi-nav-item'
                          onClick={() => navigate(route)}
                        >
                          <span className='reefpi-nav-icon'>{route.icon}</span>
                          <span className='reefpi-nav-label'>{route.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className='reefpi-sidebar-foot'>
              {footer ? footer(true) : null}
              <button
                type='button'
                className='reefpi-nav-item'
                onClick={() => { closeDrawer(); onSignOut?.() }}
              >
                <span className='reefpi-nav-icon'><SignOutIcon /></span>
                <span className='reefpi-nav-label'>{l.signOut}</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function HamburgerIcon () {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' aria-hidden='true'>
      <line x1='3' y1='5' x2='17' y2='5' /><line x1='3' y1='10' x2='17' y2='10' /><line x1='3' y1='15' x2='17' y2='15' />
    </svg>
  )
}
function MoreIcon () {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
      <circle cx='4' cy='10' r='1.5' /><circle cx='10' cy='10' r='1.5' /><circle cx='16' cy='10' r='1.5' />
    </svg>
  )
}
function CloseIcon () {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' aria-hidden='true'>
      <line x1='3' y1='3' x2='13' y2='13' /><line x1='13' y1='3' x2='3' y2='13' />
    </svg>
  )
}
function SignOutIcon () {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <path d='M7 10h9M13 7l3 3-3 3M10 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6' />
    </svg>
  )
}

// ── Default routes (design-system previews) ───────────────────────────────────

const PRIMARY_ROUTES = [
  { id: 'dashboard', label: 'Dashboard', icon: NAV_ICONS.dashboard, group: 'observe' },
  { id: 'equipment', label: 'Equipment', icon: NAV_ICONS.equipment, group: 'operate' },
  { id: 'lighting', label: 'Lighting', icon: NAV_ICONS.lighting, group: 'operate' },
  { id: 'temperature', label: 'Temp', icon: NAV_ICONS.temperature, group: 'operate' }
]

const ALL_ROUTES = [
  ...PRIMARY_ROUTES,
  { id: 'ato', label: 'ATO', icon: NAV_ICONS.ato, group: 'operate' },
  { id: 'ph', label: 'pH', icon: NAV_ICONS.ph, group: 'operate' },
  { id: 'timers', label: 'Timers', icon: NAV_ICONS.timers, group: 'operate' },
  { id: 'configuration', label: 'Configuration', icon: NAV_ICONS.configuration, group: 'configure' }
]

BottomNav.propTypes = {
  primaryRoutes: PropTypes.array,
  allRoutes: PropTypes.array,
  groups: PropTypes.array,
  labels: PropTypes.object,
  activeRoute: PropTypes.string,
  onNavigate: PropTypes.func,
  onSignOut: PropTypes.func,
  footer: PropTypes.func
}
