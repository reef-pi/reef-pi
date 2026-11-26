import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { NAV_ICONS } from './navIcons'

/*
 * Desktop navigation (≥992px; BottomNav takes over below). Aquatic Precision (#3289):
 * a neutral panel, not the green gradient.
 *
 * Expanded (default, 240px): routes in labelled groups — Observe / Operate / Configure.
 * Collapsed (72px rail): icons only; each link keeps its name (aria-label + hover tooltip)
 * and the groups are separated by rules. The choice persists in localStorage.
 *
 * The sidebar publishes its width as --reefpi-sidebar-width on <html> so the content panel
 * can clear it without knowing which state it is in.
 *
 * Usage:
 *   <Sidebar
 *     routes={[{ id, label, href, icon, group }]}
 *     groups={[{ id: 'observe', label: 'Observe' }, ...]}
 *     activeRoute='dashboard'
 *     onNavigate={route => {}}
 *     onSignOut={fn}
 *     footer={expanded => <SystemStatus compact={!expanded} ... />}
 *   />
 */

const STORAGE_KEY = 'reefpi.sidebar-expanded'

export const DEFAULT_GROUPS = [
  { id: 'observe', label: 'Observe' },
  { id: 'operate', label: 'Operate' },
  { id: 'configure', label: 'Configure' }
]

const DEFAULT_LABELS = {
  nav: 'Main navigation',
  expand: 'Expand sidebar',
  collapse: 'Collapse sidebar',
  signOut: 'Sign out',
  tagline: 'Aquarium controller'
}

// Routes without a known group are listed last, under no heading.
export function groupRoutes (routes, groups) {
  const known = groups.map(group => ({ ...group, routes: routes.filter(route => route.group === group.id) }))
  const rest = routes.filter(route => !groups.some(group => group.id === route.group))
  if (rest.length) known.push({ id: 'other', label: '', routes: rest })
  return known.filter(group => group.routes.length > 0)
}

export default function Sidebar ({
  routes = DEFAULT_ROUTES,
  groups = DEFAULT_GROUPS,
  labels = {},
  activeRoute,
  onSignOut,
  onNavigate,
  footer
}) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const [expanded, setExpanded] = useState(() => {
    try { return window.localStorage.getItem(STORAGE_KEY) !== 'false' } catch { return true }
  })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 992px)')
    const update = () => setVisible(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const width = !visible ? '0px' : expanded ? 'var(--reefpi-sidebar-expanded)' : 'var(--reefpi-sidebar-rail)'
    document.documentElement.style.setProperty('--reefpi-sidebar-width', width)
  }, [visible, expanded])

  const toggleExpanded = useCallback(() => {
    setExpanded(value => {
      const next = !value
      try { window.localStorage.setItem(STORAGE_KEY, String(next)) } catch {}
      return next
    })
  }, [])

  if (!visible) return null

  return (
    <nav
      aria-label={l.nav}
      data-testid='smoke-nav'
      className={'reefpi-sidebar ' + (expanded ? 'reefpi-sidebar--expanded' : 'reefpi-sidebar--rail')}
    >
      <div className='reefpi-sidebar-head'>
        <a href='/' data-testid='smoke-brand' className='reefpi-brand' aria-label='reef-pi'>
          <span className='reefpi-brand-mark' aria-hidden='true'>rp</span>
          {expanded && (
            <span className='reefpi-brand-text' aria-hidden='true'>
              <span className='reefpi-brand-name'>reef-pi</span>
              <span className='reefpi-brand-tagline'>{l.tagline}</span>
            </span>
          )}
        </a>
        <button
          type='button'
          className='reefpi-sidebar-toggle'
          aria-label={expanded ? l.collapse : l.expand}
          aria-expanded={expanded}
          onClick={toggleExpanded}
        >
          <ChevronIcon expanded={expanded} />
        </button>
      </div>

      <div className='reefpi-sidebar-body'>
        {groupRoutes(routes, groups).map(group => (
          <div key={group.id} className='reefpi-nav-group' role='group' aria-label={group.label || undefined}>
            {expanded && group.label && <p className='reefpi-nav-group-label' aria-hidden='true'>{group.label}</p>}
            <ul className='reefpi-nav-list'>
              {group.routes.map(route => (
                <li key={route.id}>
                  <NavItem route={route} active={activeRoute === route.id} expanded={expanded} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className='reefpi-sidebar-foot'>
        {footer ? footer(expanded) : null}
        <button
          type='button'
          onClick={onSignOut}
          aria-label={l.signOut}
          data-testid='smoke-sign-out'
          className='reefpi-nav-item'
        >
          <span className='reefpi-nav-icon'><SignOutIcon /></span>
          {expanded && <span className='reefpi-nav-label'>{l.signOut}</span>}
        </button>
      </div>
    </nav>
  )
}

function NavItem ({ route, active, expanded, onNavigate }) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  return (
    <a
      href={route.href}
      data-testid={`smoke-tab-${route.id}`}
      aria-current={active ? 'page' : undefined}
      aria-label={expanded ? undefined : route.label}
      className='reefpi-nav-item'
      onClick={e => { if (onNavigate) { e.preventDefault(); onNavigate(route) } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <span className='reefpi-nav-icon'>{route.icon}</span>
      {expanded && <span className='reefpi-nav-label'>{route.label}</span>}
      {(hovered || focused) && !expanded && <span role='tooltip' className='reefpi-nav-tooltip'>{route.label}</span>}
    </a>
  )
}

NavItem.propTypes = {
  route: PropTypes.object.isRequired,
  active: PropTypes.bool,
  expanded: PropTypes.bool,
  onNavigate: PropTypes.func
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ChevronIcon ({ expanded }) {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      {expanded
        ? <polyline points='10,4 6,8 10,12' />
        : <polyline points='6,4 10,8 6,12' />}
    </svg>
  )
}

ChevronIcon.propTypes = { expanded: PropTypes.bool }

function SignOutIcon () {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <path d='M7 10h9M13 7l3 3-3 3' />
      <path d='M10 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6' />
    </svg>
  )
}

// ── Default routes (design-system previews) ───────────────────────────────────

const DEFAULT_ROUTES = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: NAV_ICONS.dashboard, group: 'observe' },
  { id: 'equipment', label: 'Equipment', href: '/equipment', icon: NAV_ICONS.equipment, group: 'operate' },
  { id: 'lighting', label: 'Lighting', href: '/lighting', icon: NAV_ICONS.lighting, group: 'operate' },
  { id: 'temperature', label: 'Temperature', href: '/temperature', icon: NAV_ICONS.temperature, group: 'operate' },
  { id: 'ato', label: 'ATO', href: '/ato', icon: NAV_ICONS.ato, group: 'operate' },
  { id: 'ph', label: 'pH', href: '/ph', icon: NAV_ICONS.ph, group: 'operate' },
  { id: 'timers', label: 'Timers', href: '/timers', icon: NAV_ICONS.timers, group: 'operate' },
  { id: 'configuration', label: 'Configuration', href: '/configuration', icon: NAV_ICONS.configuration, group: 'configure' }
]

Sidebar.propTypes = {
  routes: PropTypes.array,
  groups: PropTypes.array,
  labels: PropTypes.object,
  activeRoute: PropTypes.string,
  onSignOut: PropTypes.func,
  onNavigate: PropTypes.func,
  footer: PropTypes.func
}
