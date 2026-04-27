import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import SelectEquipment, { RawSelectEquipment } from './select_equipment'

const mockStore = configureMockStore([thunk])

const equipment = [
  { id: '1', name: 'Heater' },
  { id: '2', name: 'Skimmer' }
]

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

describe('SelectEquipment', () => {
  it('renders without throwing with active equipment', () => {
    const component = new RawSelectEquipment({
      id: 'eq-sel',
      active: '1',
      equipment,
      update: jest.fn(),
      fetchEquipment: jest.fn()
    })

    expect(() => component.render()).not.toThrow()
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
    const button = rendered.props.children[0]
    expect(button.props.disabled).toBe(true)
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

    component.setEquipment(1)()
    expect(component.state.equipment).toEqual(equipment[1])
    expect(update).toHaveBeenCalledWith('2')

    component.setEquipment('none')()
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
    expect(countByType(component.render(), node => node.type === 'a')).toBeGreaterThan(0)
  })

  it('setEquipment none clears selection and calls update with empty string', () => {
    const update = jest.fn()
    const store = mockStore({ equipment })
    const wrapper = mount(<Provider store={store}><SelectEquipment id='eq-sel' active='1' update={update} /></Provider>)
    wrapper.find('a.dropdown-item').first().prop('onClick')()
    expect(update).toHaveBeenCalledWith('')
    wrapper.unmount()
  })

  it('setEquipment by index sets selection and calls update with id', () => {
    const update = jest.fn()
    const store = mockStore({ equipment })
    const wrapper = mount(<Provider store={store}><SelectEquipment id='eq-sel' active='' update={update} /></Provider>)
    wrapper.find('a.dropdown-item').at(1).prop('onClick')()
    expect(update).toHaveBeenCalledWith('1')
    wrapper.unmount()
  })

  it('setEquipment selects second equipment item', () => {
    const update = jest.fn()
    const store = mockStore({ equipment })
    const wrapper = mount(<Provider store={store}><SelectEquipment id='eq-sel' active='' update={update} /></Provider>)
    wrapper.find('a.dropdown-item').at(2).prop('onClick')()
    expect(update).toHaveBeenCalledWith('2')
    wrapper.unmount()
  })
})
