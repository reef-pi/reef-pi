import React, { act } from 'react'
import Equipment from './equipment'
import ViewEquipment from './view_equipment'
import EditEquipment from './edit_equipment'
import EquipmentForm, { mapEquipmentPropsToValues, submitEquipmentForm } from './equipment_form'
import Chart, { RawEquipmentChart } from './chart'
import Main, { RawEquipmentMain } from './main'
import { buildEquipmentPayload, SORT_NAME_AZ, SORT_NAME_ZA, SORT_ON_FIRST, SORT_OFF_FIRST, sortEquipment } from './utils'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

jest.mock('utils/confirm', () => {
  return {
    confirm: jest
      .fn()
      .mockImplementation(() => Promise.resolve(true))
      .bind(this)
  }
})

describe('Equipment ui', () => {
  const flattenElements = (node) => {
    const elements = []
    const visit = child => {
      if (!child) {
        return
      }
      if (Array.isArray(child)) {
        child.forEach(visit)
        return
      }
      elements.push(child)
      if (child.props && child.props.children) {
        visit(child.props.children)
      }
    }
    visit(node)
    return elements
  }

  const findByType = (node, type) => flattenElements(node).filter(element => element.type === type)
  const findByProps = (node, props) => flattenElements(node).find(element => {
    return Object.entries(props).every(([key, value]) => element.props && element.props[key] === value)
  })

  const eqs = [{ id: '1', outlet: '1', name: 'Foo', on: true }]
  const outlets = [{ id: '1', name: 'O1' }]

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Main />', () => {
    const main = new RawEquipmentMain({
      equipment: eqs,
      outlets,
      fetch: jest.fn(),
      fetchOutlets: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    })
    expect(main.render().type).toBe('ul')
    expect(Main).toBeDefined()
  })

  it('sortEquipment supports all sort modes without mutating input', () => {
    const unsorted = [
      { id: '1', name: 'Beta', on: false },
      { id: '2', name: 'Alpha', on: true }
    ]
    expect(sortEquipment(unsorted, SORT_NAME_AZ).map(e => e.name)).toEqual(['Alpha', 'Beta'])
    expect(sortEquipment(unsorted, SORT_NAME_ZA).map(e => e.name)).toEqual(['Beta', 'Alpha'])
    expect(sortEquipment(unsorted, SORT_ON_FIRST).map(e => e.name)).toEqual(['Alpha', 'Beta'])
    expect(sortEquipment(unsorted, SORT_OFF_FIRST).map(e => e.name)).toEqual(['Beta', 'Alpha'])
    expect(unsorted.map(e => e.name)).toEqual(['Beta', 'Alpha'])
  })

  it('buildEquipmentPayload preserves existing fields and applies updates', () => {
    expect(buildEquipmentPayload(eqs[0], { on: false })).toEqual({
      id: '1',
      name: 'Foo',
      on: false,
      outlet: '1',
      stay_off_on_boot: undefined,
      boot_delay: 0
    })
  })

  it('<Equipment />', () => {
    const instance = new Equipment({ equipment: eqs[0], update: jest.fn(), delete: jest.fn(), outlets })
    expect(instance.render().type).toBe('li')
  })

  it('should handle delete', async () => {
    const del = jest.fn()
    const instance = new Equipment({ equipment: eqs[0], update: jest.fn(), delete: del, outlets })
    instance.handleDelete({ stopPropagation: () => {} })
    await Promise.resolve()
    expect(del).toHaveBeenCalledWith('1')
  })

  it('should handle submit', async () => {
    const update = jest.fn().mockResolvedValue(true)
    const instance = new Equipment({ equipment: eqs[0], update, delete: jest.fn(), outlets })
    instance.setState = nextState => { instance.state = { ...instance.state, ...nextState } }
    const values = {
      id: 1,
      name: 'test',
      outlet: 3,
      on: false
    }
    await instance.handleSubmit(values)
    expect(update).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'test', outlet: 3 }))
    expect(instance.state.readOnly).toBe(true)
  })

  it('should handle an unrecognized outlet', () => {
    const instance = new Equipment({ equipment: eqs[0], update: jest.fn(), delete: jest.fn(), outlets: [{ id: '2', name: 'O1' }] })
    expect(instance.selectedOutlet()).toEqual({ name: '' })
  })

  it('should toggle edit', () => {
    const instance = new Equipment({ equipment: eqs[0], update: jest.fn(), delete: jest.fn(), outlets: [{ id: '2', name: 'O1' }] })
    instance.setState = nextState => { instance.state = { ...instance.state, ...nextState } }
    instance.handleToggleEdit({ stopPropagation: () => {} })
    expect(instance.state.readOnly).toBe(false)
  })

  it('<ViewEquipment />', () => {
    const wrapper = ViewEquipment({ equipment: eqs[0], outletName: 'O1', onStateChange: jest.fn(), onDelete: jest.fn(), onEdit: jest.fn() })
    expect(wrapper.type).toBe('div')
  })

  it('<ViewEquipment /> off', () => {
    const wrapper = ViewEquipment({ equipment: { ...eqs[0], on: false }, outletName: 'O1', onStateChange: jest.fn(), onDelete: jest.fn(), onEdit: jest.fn() })
    expect(wrapper.type).toBe('div')
  })

  it('<ViewEquipment /> should toggle state', () => {
    const onStateChange = jest.fn()
    const wrapper = ViewEquipment({
      onStateChange,
      equipment: eqs[0],
      outletName: 'O1',
      onDelete: jest.fn(),
      onEdit: jest.fn()
    })

    const switchControl = flattenElements(wrapper).find(element => element.props && element.props.onClick && Object.prototype.hasOwnProperty.call(element.props, 'on'))
    act(() => {
      switchControl.props.onClick({})
    })
    expect(onStateChange).toHaveBeenCalledWith('1', expect.objectContaining({ on: false }))
  })

  it('<EditEquipment />', () => {
    const wrapper = EditEquipment({
      actionLabel: 'save',
      values: { id: 1, name: 'Foo', outlet: '1' },
      outlets: [{ id: '1', name: 'O1' }],
      handleBlur: jest.fn(),
      submitForm: jest.fn()
    })
    expect(wrapper.type).toBe('form')
  })

  it('<EditEquipment /> New Item', () => {
    const wrapper = EditEquipment({
      actionLabel: 'save',
      values: { id: null, name: '', outlet: '' },
      outlets: [{ id: '1', name: 'O1' }],
      handleBlur: jest.fn(),
      submitForm: jest.fn()
    })
    expect(wrapper.type).toBe('form')
  })

  it('<EditEquipment /> should submit', () => {
    const wrapper = EditEquipment({
      actionLabel: 'save',
      values: { id: null, name: '', outlet: '' },
      outlets: [{ id: '1', name: 'O1' }],
      handleBlur: jest.fn(),
      submitForm: jest.fn(),
      isValid: true
    })
    wrapper.props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditEquipment /> should show alert when invalid', () => {
    const wrapper = EditEquipment({
      actionLabel: 'save',
      values: { id: null, name: '', outlet: '' },
      outlets: [{ id: '1', name: 'O1' }],
      handleBlur: jest.fn(),
      submitForm: jest.fn(),
      isValid: false
    })
    wrapper.props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EquipmentForm />', () => {
    const fn = jest.fn()
    const values = mapEquipmentPropsToValues({
      equipment: { id: '1', name: 'Foo', outlet: '1', on: true },
      outlets: [{ id: '1', name: 'O1' }]
    })
    submitEquipmentForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ name: 'Foo' }))
    expect(EquipmentForm).toBeDefined()
  })

  it('<Chart />', () => {
    const chart = new RawEquipmentChart({ equipment: eqs, fetchEquipment: jest.fn(), height: 200 })
    expect(chart.render().props.className).toBe('container')
    expect(Chart).toBeDefined()
  })

  it('<Chart /> handles undefined equipment', () => {
    const chart = new RawEquipmentChart({ equipment: undefined, fetchEquipment: jest.fn(), height: 200 })
    expect(chart.render().type).toBe('div')
  })
})
