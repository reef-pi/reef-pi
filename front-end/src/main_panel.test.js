import React from 'react'
import MainPanel, { RawMainPanel } from './main_panel'
import {
  currentRouteForPath,
  mainPanelRoutes,
  navigationRoutes,
  routeMatchesLocation,
  routeNavigationPath
} from './main_panel_routes'
import 'isomorphic-fetch'

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
})
