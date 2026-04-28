import React from 'react'
import MainPanel, { RawMainPanel } from './main_panel'
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
})
