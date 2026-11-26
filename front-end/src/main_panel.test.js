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
    expect(countByType(panel.render(), node => node.type && node.type.name === 'NewShellNav')).toBe(1)
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
    const shellNav = findAll(rendered, node => node.type && node.type.name === 'NewShellNav')[0]
    const summary = findAll(rendered, node => node.type?.name === 'Summary')[0]

    expect(smokeRoot.props.id).toBe('content')
    expect(shellNav.props.capabilities.equipment).toBe(true)
    expect(summary.props.info.name).toBe('reef-pi-test')
    expect(summary.props.errors).toHaveLength(1)
    expect(summary.props.devMode).toBe(true)
    expect(countByType(rendered, node => node.type?.name === 'Routes')).toBe(1)
  })

  it('renders the sidebar and bottom navigation', () => {
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

    expect(container.querySelector('[data-testid="smoke-nav"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="smoke-tab-dashboard"]')).not.toBeNull()
    expect(container.querySelector('[aria-label="Main navigation"]')).not.toBeNull()
    // The 72px sidebar offset is a >= 992px media query (no inline style), so phones keep the plain gutter.
    const contentPanel = container.querySelector('[data-testid="smoke-content-panel"]')
    expect(contentPanel.classList.contains('content-panel')).toBe(true)
    expect(contentPanel.style.paddingLeft).toBe('')
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

  it('renders NewShellNav as the only navigation', () => {
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
    // The bell now lives in the PageHeader (route title + page actions).
    const header = findAll(rendered, node => node.type && node.type.name === 'PageHeader')[0]
    const legacyNotify = findAll(rendered, node => node.type && node.type.name === 'NotificationAlert')[0]
    expect(header).toBeDefined()
    expect(legacyNotify).toBeUndefined()
    window.FEATURE_FLAGS = {}
  })
})
