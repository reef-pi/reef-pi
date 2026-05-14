import React from 'react'
import Drivers, { RawDriversMain, mapDispatchToProps, mapStateToProps } from './main'
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
  const makeProps = overrides => ({
    drivers: [],
    driverOptions: [],
    fetch: jest.fn(),
    fetchDriverOptions: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    provision: jest.fn(),
    ...overrides
  })

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
      headers: expect.any(Headers),
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

  it('passes driver actions and options through sorted driver rows', () => {
    const remove = jest.fn()
    const update = jest.fn()
    const provision = jest.fn()
    const unsortedDrivers = [
      { id: '2', name: 'Zulu', type: 'pca9685', config: {} },
      { id: '1', name: 'Alpha', type: 'rpi', config: {} }
    ]
    const main = new RawDriversMain(makeProps({
      drivers: unsortedDrivers,
      driverOptions,
      delete: remove,
      update,
      provision
    }))

    const driverNodes = main.list()

    expect(driverNodes.map(node => node.props.driver.name)).toEqual(['Alpha', 'Zulu'])
    expect(driverNodes[0].props.driverOptions).toBe(driverOptions)
    expect(driverNodes[0].props.validate).toBe(main.validate)
    expect(driverNodes[0].props.remove).toBe(remove)
    expect(driverNodes[0].props.update).toBe(update)
    expect(driverNodes[0].props.provision).toBe(provision)
    expect(unsortedDrivers.map(driver => driver.name)).toEqual(['Zulu', 'Alpha'])
  })

  it('passes create hook, options, and validate callback to New driver form', () => {
    const create = jest.fn()
    const main = new RawDriversMain(makeProps({
      drivers,
      driverOptions,
      create
    }))

    const newDriver = findNodes(main.render(), node => node.type === New)[0]

    expect(newDriver.props.drivers).toBe(drivers)
    expect(newDriver.props.driverOptions).toBe(driverOptions)
    expect(newDriver.props.hook).toBe(create)
    expect(newDriver.props.validate).toBe(main.validate)
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

  it('maps state and dispatch props for the connected driver container', () => {
    const state = { drivers, driverOptions }
    expect(mapStateToProps(state)).toEqual({ drivers, driverOptions })

    const dispatch = jest.fn(action => action)
    const props = mapDispatchToProps(dispatch)
    props.fetch()
    props.fetchDriverOptions()
    props.create({ name: 'new' })
    props.delete('1')
    props.update('2', { name: 'updated' })
    props.provision('2')

    expect(dispatch).toHaveBeenCalledTimes(6)
  })
})
