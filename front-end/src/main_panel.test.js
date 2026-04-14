import React from 'react'
import { MainPanelView } from './main_panel'

describe('MainPanel', () => {
  it('builds navs from enabled capabilities', () => {
    const panel = new MainPanelView({
      info: { name: 'reef-pi' },
      errors: [],
      capabilities: {
        dashboard: true,
        equipment: true,
        timers: false,
        dev_mode: false
      },
      fetchUIData: jest.fn(),
      fetchInfo: jest.fn()
    })

    const navs = panel.navs(panel.props.capabilities)
    expect(navs.props.className).toBe('navbar-nav')
    const labels = navs.props.children.map(child => child.props.children.props.children)
    expect(labels).toContain('dashboard')
    expect(labels).toContain('equipment')
    expect(labels).not.toContain('timers')
  })

  it('renders without throwing for different capability sets', () => {
    const withDashboard = new MainPanelView({
      info: { name: 'reef-pi' },
      errors: [],
      capabilities: {
        dashboard: true,
        equipment: true,
        timers: false,
        dev_mode: false
      },
      fetchUIData: jest.fn(),
      fetchInfo: jest.fn()
    })
    const withoutDashboard = new MainPanelView({
      info: { name: 'reef-pi' },
      errors: [],
      capabilities: {
        dashboard: false,
        equipment: true,
        timers: false,
        dev_mode: false
      },
      fetchUIData: jest.fn(),
      fetchInfo: jest.fn()
    })

    expect(() => withDashboard.render()).not.toThrow()
    expect(() => withoutDashboard.render()).not.toThrow()
  })
})
