import React from 'react'
import Drivers, { RawDriversMain } from './main'
import Driver from './driver'
import New from './new'
import 'isomorphic-fetch'

const drivers = [
  { id: '1', name: 'RPI', type: 'rpi', config: {} },
  { id: '2', name: 'PCA', type: 'pca9685', config: {} }
]
const driverOptions = [{ name: 'pca9685', display: 'PCA9685' }]

const findNodes = (node, predicate, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (predicate(node)) {
    acc.push(node)
  }
  React.Children.toArray(node.props?.children).forEach(child => {
    findNodes(child, predicate, acc)
  })
  return acc
}

describe('Drivers Main', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('validates drivers through the driver validation API', () => {
    const response = Promise.resolve({ ok: true })
    global.fetch = jest.fn(() => response)
    const main = new RawDriversMain({
      drivers: [],
      driverOptions: [],
      fetch: jest.fn(),
      fetchDriverOptions: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      provision: jest.fn()
    })
    const payload = { type: 'pca9685', config: { address: 64 } }

    expect(main.validate(payload)).toBe(response)
    expect(global.fetch).toHaveBeenCalledWith('api/drivers/validate', {
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    })
  })

  it('renders with empty drivers and fetches on mount', () => {
    const fetch = jest.fn()
    const fetchDriverOptions = jest.fn()
    const main = new RawDriversMain({
      drivers: [],
      driverOptions: [],
      fetch,
      fetchDriverOptions,
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      provision: jest.fn()
    })

    main.componentDidMount()
    expect(fetch).toHaveBeenCalled()
    expect(fetchDriverOptions).toHaveBeenCalled()
    expect(() => main.render()).not.toThrow()
  })

  it('renders drivers including rpi type as read_only', () => {
    const unsortedDrivers = [
      { id: '1', name: 'RPI B', type: 'rpi', config: {} },
      { id: '2', name: 'PCA A', type: 'pca9685', config: {} }
    ]
    const main = new RawDriversMain({
      drivers: unsortedDrivers,
      driverOptions,
      fetch: jest.fn(),
      fetchDriverOptions: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      provision: jest.fn()
    })

    const rendered = main.render()
    const driverNodes = findNodes(rendered, node => node.type === Driver)
    expect(driverNodes).toHaveLength(2)
    const byId = Object.fromEntries(driverNodes.map(node => [node.props.driver.id, node.props]))
    expect(byId['1'].read_only).toBe(true)
    expect(byId['2'].read_only).toBe(false)
    expect(unsortedDrivers.map(driver => driver.name)).toEqual(['RPI B', 'PCA A'])
  })

  it('renders with non-rpi driver', () => {
    const pcaOnly = [{ id: '2', name: 'PCA', type: 'pca9685', config: {} }]
    const main = new RawDriversMain({
      drivers: pcaOnly,
      driverOptions,
      fetch: jest.fn(),
      fetchDriverOptions: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      provision: jest.fn()
    })

    const driverNodes = findNodes(main.render(), node => node.type === Driver)
    expect(driverNodes).toHaveLength(1)
    expect(driverNodes[0].props.read_only).toBe(false)
  })

  it('renders without throwing with drivers', () => {
    const main = new RawDriversMain({
      drivers,
      driverOptions,
      fetch: jest.fn(),
      fetchDriverOptions: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      provision: jest.fn()
    })

    expect(() => main.render()).not.toThrow()
    expect(findNodes(main.render(), node => node.type === New)).toHaveLength(1)
  })

  it('renders without throwing with empty list', () => {
    const main = new RawDriversMain({
      drivers: [],
      driverOptions: [],
      fetch: jest.fn(),
      fetchDriverOptions: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      provision: jest.fn()
    })

    expect(() => main.render()).not.toThrow()
    expect(Drivers).toBeDefined()
  })
})
