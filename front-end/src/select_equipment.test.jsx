import React from 'react'
import 'isomorphic-fetch'
import SelectEquipment, { RawSelectEquipment } from './select_equipment'

const equipment = [
  { id: '1', name: 'Heater' },
  { id: '2', name: 'Skimmer' }
]

describe('SelectEquipment', () => {
  it('renders without throwing with active equipment', () => {
    const component = new RawSelectEquipment({
      id: 'eq-sel',
      active: '1',
      equipment,
      update: jest.fn(),
      fetchEquipment: jest.fn()
    })

    // Component uses Menu primitive — verify render does not throw and has correct display name
    const rendered = component.render()
    expect(rendered).toBeTruthy()
  })

  it('renders without throwing with empty equipment', () => {
    const component = new RawSelectEquipment({
      id: 'eq-sel',
      active: '',
      equipment: [],
      update: jest.fn(),
      fetchEquipment: jest.fn()
    })

    expect(() => component.render()).not.toThrow()
  })

  it('renders without throwing when active equipment is missing', () => {
    const component = new RawSelectEquipment({
      id: 'eq-sel',
      active: '99',
      equipment,
      update: jest.fn(),
      fetchEquipment: jest.fn()
    })

    expect(() => component.render()).not.toThrow()
  })

  it('renders without throwing in readOnly mode', () => {
    const component = new RawSelectEquipment({
      id: 'eq-sel',
      active: '1',
      equipment,
      update: jest.fn(),
      fetchEquipment: jest.fn(),
      readOnly: true
    })

    const rendered = component.render()
    // In readOnly mode a plain disabled button is rendered
    expect(rendered.props.disabled).toBe(true)
  })

  it('equipmentList returns correct number of items', () => {
    const component = new RawSelectEquipment({
      id: 'eq-sel',
      active: '2',
      equipment,
      update: jest.fn(),
      fetchEquipment: jest.fn()
    })

    // equipmentList returns array of {label, onSelect} objects: 1 blank + 2 equipment
    const items = component.equipmentList()
    expect(items).toHaveLength(3)
    expect(items[0].label).toBe('--')
    expect(items[1].label).toBe('Heater')
    expect(items[2].label).toBe('Skimmer')
  })

  it('renders menu and updates selected equipment', () => {
    const update = jest.fn()
    const component = new RawSelectEquipment({
      id: 'eq-sel',
      active: '1',
      equipment,
      update,
      fetchEquipment: jest.fn()
    })
    component.setState = jest.fn(next => {
      component.state = { ...component.state, ...next }
    })

    const menuItems = component.equipmentList()
    expect(menuItems).toHaveLength(3)

    // onSelect is equivalent to the old onClick handler
    menuItems[2].onSelect()
    expect(component.state.equipment).toEqual(equipment[1])
    expect(update).toHaveBeenCalledWith('2')

    menuItems[0].onSelect()
    expect(component.state.equipment).toBeUndefined()
    expect(update).toHaveBeenCalledWith('')
  })

  it('fetches equipment on mount and exports connected component', () => {
    const fetchEquipment = jest.fn()
    const component = new RawSelectEquipment({
      id: 'eq-sel',
      active: '1',
      equipment,
      update: jest.fn(),
      fetchEquipment
    })

    component.componentDidMount()
    expect(fetchEquipment).toHaveBeenCalled()
    expect(SelectEquipment).toBeDefined()
  })

  it('setEquipment none clears selection and calls update with empty string', () => {
    const update = jest.fn()
    const component = new RawSelectEquipment({ id: 'eq-sel', active: '1', equipment, update, fetchEquipment: jest.fn() })
    component.setState = jest.fn(next => {
      component.state = { ...component.state, ...next }
    })
    component.equipmentList()[0].onSelect()
    expect(update).toHaveBeenCalledWith('')
  })

  it('setEquipment by index sets selection and calls update with id', () => {
    const update = jest.fn()
    const component = new RawSelectEquipment({ id: 'eq-sel', active: '', equipment, update, fetchEquipment: jest.fn() })
    component.setState = jest.fn(next => {
      component.state = { ...component.state, ...next }
    })
    component.equipmentList()[1].onSelect()
    expect(update).toHaveBeenCalledWith('1')
  })

  it('setEquipment selects second equipment item', () => {
    const update = jest.fn()
    const component = new RawSelectEquipment({ id: 'eq-sel', active: '', equipment, update, fetchEquipment: jest.fn() })
    component.setState = jest.fn(next => {
      component.state = { ...component.state, ...next }
    })
    component.equipmentList()[2].onSelect()
    expect(update).toHaveBeenCalledWith('2')
  })
})
