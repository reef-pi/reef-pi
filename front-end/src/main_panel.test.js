import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { thunk } from 'redux-thunk'
import MainPanel, { RawMainPanel } from './main_panel'
import {
  currentRouteForPath,
  mainPanelRoutes,
  navigationRoutes,
  routeMatchesLocation,
  routeNavigationPath
} from './main_panel_routes'
import 'isomorphic-fetch'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const mockStore = configureMockStore([thunk])

const countByType = (node, predicate) => {
  if (!node || typeof node !== 'object') {
    return 0
  }
  let count = predicate(node) ? 1 : 0
  React.Children.toArray(node.props?.children).forEach(child => {
    count += countByType(child, predicate)
  })
  return count
}

const findAll = (node, predicate) => {
  if (!node || typeof node !== 'object') {
    return []
  }
  const matches = predicate(node) ? [node] : []
  React.Children.toArray(node.props?.children).forEach(child => {
    matches.push(...findAll(child, predicate))
  })
  return matches
}

describe('MainPanel', () => {
  const renderDomPanel = props => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const store = mockStore({
      alerts: [],
      errors: props.errors,
      timers: [],
      equipment: [],
      macros: [],
      capabilities: props.capabilities,
      info: props.info
    })

    act(() => {
      root.render(
        <Provider store={store}>
          <RawMainPanel {...props} />
        </Provider>
      )
    })

    return {
      container,
      unmount: () => act(() => {
        root.unmount()
        container.remove()
      })
    }
  }

  afterEach(() => {
    jest.restoreAllMocks()
    window.FEATURE_FLAGS = {}
    window.history.pushState({}, '', '/')
    document.body.innerHTML = ''
  })

  it('<MainPanel />', () => {
    const state = {
      info: { name: 'reef-pi' },
      errors: [],
      capabilities: {
        dashboard: true,
        equipment: true,
        timers: false,
        dev_mode: false
      }
    }

    const panel = new RawMainPanel({
      ...state,
      fetchUIData: jest.fn(),
      fetchInfo: jest.fn()
    })

    panel.componentDidMount()
    expect(panel.props.fetchUIData).toHaveBeenCalled()
    expect(() => panel.render()).not.toThrow()
    expect(MainPanel).toBeDefined()
    expect(countByType(panel.render(), node => node.type === 'nav')).toBeGreaterThan(0)
  })

  it('renders shell chrome, summary, and route container with supplied state', () => {
    const panel = new RawMainPanel({
      info: { name: 'reef-pi-test' },
      errors: [{ id: '1', message: 'boom' }],
      capabilities: {
        dashboard: true,
        equipment: true,
        configuration: true,
        dev_mode: true
      },
      fetchUIData: jest.fn(),
      fetchInfo: jest.fn()
    })
    const rendered = panel.render()
    const smokeRoot = findAll(rendered, node => node.props?.['data-testid'] === 'smoke-shell-root')[0]
    const brand = findAll(rendered, node => node.props?.['data-testid'] === 'smoke-brand')[0]
    const nav = findAll(rendered, node => node.props?.['data-testid'] === 'smoke-nav')[0]
    const summary = findAll(rendered, node => node.type?.name === 'Summary')[0]

    expect(smokeRoot.props.id).toBe('content')
    expect(brand.props.children).toBe('reef-pi-test')
    expect(nav.props.id).toBe('navbarNav')
    expect(summary.props.info.name).toBe('reef-pi-test')
    expect(summary.props.errors).toHaveLength(1)
    expect(summary.props.devMode).toBe(true)
    expect(countByType(rendered, node => node.type?.name === 'Routes')).toBe(1)
  })

  it('renders DOM shell and current route label from browser location', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    window.history.pushState({}, '', '/timers')
    const fetchUIData = jest.fn()
    const fetchInfo = jest.fn()
    const { container, unmount } = renderDomPanel({
      info: { name: 'reef-pi-dom' },
      errors: [],
      capabilities: {
        dashboard: true,
        timers: true,
        configuration: true,
        dev_mode: false
      },
      fetchUIData,
      fetchInfo
    })

    expect(fetchUIData).toHaveBeenCalled()
    expect(container.querySelector('[data-testid="smoke-brand"]').textContent).toBe('reef-pi-dom')
    expect(container.querySelector('[data-testid="smoke-current-tab"]').textContent).toBe('timers')
    expect(container.querySelector('[data-testid="smoke-nav"]').id).toBe('navbarNav')
    expect(Array.from(container.querySelectorAll('.nav-link')).map(link => link.id)).toEqual([
      'tab-dashboard',
      'tab-timers',
      'tab-configuration'
    ])
    unmount()
  })

  it('renders fallback current route label for unknown paths', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    window.history.pushState({}, '', '/custom-page')
    const { container, unmount } = renderDomPanel({
      info: { name: 'reef-pi-dom' },
      errors: [],
      capabilities: {},
      fetchUIData: jest.fn(),
      fetchInfo: jest.fn()
    })

    expect(container.querySelector('[data-testid="smoke-current-tab"]').textContent).toBe('custom-page')
    unmount()
  })

  it('renders new shell navigation when feature flag is enabled', () => {
    window.FEATURE_FLAGS = { new_shell: true }
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 480 })
    window.matchMedia = jest.fn(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }))
    window.history.pushState({}, '', '/equipment')
    const { container, unmount } = renderDomPanel({
      info: { name: 'reef-pi-new-shell' },
      errors: [],
      capabilities: {
        dashboard: true,
        equipment: true,
        lighting: true,
        temperature: true,
        ato: true,
        dev_mode: false
      },
      fetchUIData: jest.fn(),
      fetchInfo: jest.fn()
    })

    expect(container.querySelector('[data-testid="smoke-nav"]')).toBeNull()
    expect(container.querySelector('[aria-label="Main navigation"]')).not.toBeNull()
    expect(container.querySelector('#content .container-fluid').style.paddingLeft).toBe('72px')
    expect(Array.from(container.querySelectorAll('[aria-label]')).map(node => node.getAttribute('aria-label'))).toContain('equipment')

    unmount()
  })

  it('keeps route metadata order and paths stable', () => {
    expect(mainPanelRoutes.map(route => [route.key, route.path])).toEqual([
      ['dashboard', ''],
      ['equipment', '/equipment'],
      ['timers', '/timers'],
      ['lighting', '/lighting'],
      ['temperature', '/temperature'],
      ['ato', '/ato'],
      ['ph', '/ph'],
      ['doser', '/doser'],
      ['macro', '/macro'],
      ['camera', '/camera'],
      ['manager', '/manager'],
      ['journal', '/journal'],
      ['configuration', '/configuration/*']
    ])
  })

  it('filters navigation routes with the existing capability gate', () => {
    const routes = navigationRoutes({
      dashboard: true,
      equipment: false,
      timers: 1,
      lighting: 0,
      temperature: undefined,
      configuration: true,
      dev_mode: true
    })

    expect(routes.map(route => route.key)).toEqual(['dashboard', 'timers', 'configuration'])
  })

  it('renders nav links with preserved ids, test ids, and paths', () => {
    const panel = new RawMainPanel({
      info: { name: 'reef-pi' },
      errors: [],
      capabilities: {},
      fetchUIData: jest.fn(),
      fetchInfo: jest.fn()
    })

    const nav = panel.navs({
      dashboard: true,
      timers: true,
      configuration: true
    })
    const links = findAll(nav, node => node.props?.className === 'nav-link')

    expect(links.map(link => link.props.id)).toEqual(['tab-dashboard', 'tab-timers', 'tab-configuration'])
    expect(links.map(link => link.props['data-testid'])).toEqual(['smoke-tab-dashboard', 'smoke-tab-timers', 'smoke-tab-configuration'])
    expect(links.map(link => link.props.to)).toEqual(['', '/timers', '/configuration'])
  })

  it('matches current page routes including nested configuration pages', () => {
    const dashboard = mainPanelRoutes.find(route => route.key === 'dashboard')
    const configuration = mainPanelRoutes.find(route => route.key === 'configuration')
    const equipment = mainPanelRoutes.find(route => route.key === 'equipment')

    expect(routeMatchesLocation(dashboard, '/')).toBe(true)
    expect(routeMatchesLocation(dashboard, '/dashboard')).toBe(false)
    expect(routeMatchesLocation(configuration, '/configuration')).toBe(true)
    expect(routeMatchesLocation(configuration, '/configuration/errors')).toBe(true)
    expect(routeMatchesLocation(equipment, '/equipment/1')).toBe(true)
    expect(routeMatchesLocation(equipment, '/equipmentish')).toBe(false)
    expect(currentRouteForPath('/configuration/errors').key).toBe('configuration')
    expect(currentRouteForPath('/missing')).toBeUndefined()
  })

  it('normalizes only dashboard navigation to the empty path', () => {
    expect(routeNavigationPath(mainPanelRoutes[0])).toBe('')
    expect(routeNavigationPath(mainPanelRoutes[12])).toBe('/configuration')
  })

  it('renders NewShellNav instead of navbar when new_shell flag is on', () => {
    window.FEATURE_FLAGS = { new_shell: true }
    const panel = new RawMainPanel({
      info: { name: 'reef-pi' },
      errors: [],
      capabilities: { dashboard: true, equipment: true },
      fetchUIData: jest.fn(),
      fetchInfo: jest.fn()
    })
    const rendered = panel.render()
    const newShellNav = findAll(rendered, node => node.type && node.type.name === 'NewShellNav')[0]
    expect(newShellNav).toBeDefined()
    expect(newShellNav.props.capabilities).toEqual({ dashboard: true, equipment: true })
    expect(countByType(rendered, node => node.type === 'nav')).toBe(0)
    window.FEATURE_FLAGS = {}
  })

  it('renders AlertCenterBell instead of NotificationAlert when alert_center flag is on', () => {
    window.FEATURE_FLAGS = { alert_center: true }
    const panel = new RawMainPanel({
      info: { name: 'reef-pi' },
      errors: [],
      capabilities: { dashboard: true },
      fetchUIData: jest.fn(),
      fetchInfo: jest.fn()
    })
    const rendered = panel.render()
    const bell = findAll(rendered, node => node.type && node.type.name === 'AlertCenterBell')[0]
    const legacyNotify = findAll(rendered, node => node.type && node.type.name === 'NotificationAlert')[0]
    expect(bell).toBeDefined()
    expect(legacyNotify).toBeUndefined()
    window.FEATURE_FLAGS = {}
  })
})
