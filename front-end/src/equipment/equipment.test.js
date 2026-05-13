import React, { act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Equipment from './equipment'
import ViewEquipment from './view_equipment'
import EditEquipment from './edit_equipment'
import EquipmentForm from './equipment_form'
import { RawEquipmentChart } from './chart'
import { RawEquipmentMain } from './main'
import { buildEquipmentPayload, SORT_NAME_AZ, SORT_NAME_ZA, SORT_ON_FIRST, SORT_OFF_FIRST, sortEquipment } from './utils'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'
jest.mock('utils/confirm', () => {
  return {
    confirm: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this)
  }
})

const collectElements = (node, predicate, matches = []) => {
  if (!React.isValidElement(node)) {
    return matches
  }

  if (predicate(node)) {
    matches.push(node)
  }

  React.Children.forEach(node.props.children, child => collectElements(child, predicate, matches))
  return matches
}

const findFirst = (node, predicate) => collectElements(node, predicate)[0]

describe('Equipment ui', () => {
  const eqs = [{ id: '1', outlet: '1', name: 'Foo', on: true }]
  const outlets = [{ id: '1', name: 'O1' }]
  const click = (node, event = {}) => {
    act(() => {
      node.props.onClick(event)
    })
  }

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Main />', () => {
    const props = {
      outlets,
      equipment: eqs,
      fetch: jest.fn(),
      fetchOutlets: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
    const component = new RawEquipmentMain(props)

    component.componentDidMount()

    expect(props.fetch).toHaveBeenCalled()
    expect(props.fetchOutlets).toHaveBeenCalled()
    expect(component.render().type).toBe('ul')
  })

  it('<Main /> toggles add form and creates equipment payloads', () => {
    const props = {
      outlets,
      equipment: [],
      fetch: jest.fn(),
      fetchOutlets: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
    const component = new RawEquipmentMain(props)
    component.setState = update => { component.state = { ...component.state, ...update } }

    component.handleToggleAddEquipmentDiv()
    expect(component.state.addEquipment).toBe(true)

    component.handleAddEquipment({ name: 'Return Pump', outlet: '1', on: true })
    expect(props.create).toHaveBeenCalledWith({ name: 'Return Pump', outlet: '1' })
    expect(component.state.addEquipment).toBe(false)
  })

  it('<Main /> changes sort mode and renders sorted equipment items', () => {
    const component = new RawEquipmentMain({
      outlets,
      equipment: [
        { id: '1', outlet: '1', name: 'Beta', on: true },
        { id: '2', outlet: '1', name: 'Alpha', on: false }
      ],
      fetch: jest.fn(),
      fetchOutlets: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    })
    component.setState = update => { component.state = { ...component.state, ...update } }

    component.handleSortChange({ target: { value: SORT_NAME_ZA } })
    expect(component.state.sortMode).toBe(SORT_NAME_ZA)

    const rendered = component.render()
    const equipmentItems = collectElements(rendered, node => node.type === Equipment)
    expect(equipmentItems.map(item => item.props.equipment.name)).toEqual(['Beta', 'Alpha'])
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
    const instance = new Equipment({ equipment: eqs[0], update: () => Promise.resolve(true), delete: () => true, outlets })
    expect(instance.selectedOutlet().name).toBe('O1')
  })

  it('should handle delete', () => {
    const instance = new Equipment({ equipment: eqs[0], update: () => Promise.resolve(true), delete: () => true, outlets })
    const ev = {
      stopPropagation: () => {}
    }
    instance.handleDelete(ev)
  })

  it('should handle submit', () => {
    const instance = new Equipment({
      equipment: eqs[0],
      update: () => Promise.resolve(true),
      delete: () => true,
      outlets
    })
    instance.setState = update => { instance.state = { ...instance.state, ...update } }
    const values = {
      id: 1,
      name: 'test',
      outlet: 3,
      on: false
    }
    instance.handleSubmit(values)
  })

  it('should handle an unrecognized outlet', () => {
    const instance = new Equipment({
      equipment: eqs[0],
      update: () => Promise.resolve(true),
      delete: () => true,
      outlets: [{ id: '2', name: 'O1' }]
    })
    expect(instance.selectedOutlet()).toEqual({ name: '' })
  })

  it('should toggle edit', () => {
    const instance = new Equipment({
      equipment: eqs[0],
      update: () => Promise.resolve(true),
      delete: () => true,
      outlets: [{ id: '2', name: 'O1' }]
    })
    instance.setState = update => { instance.state = { ...instance.state, ...update } }

    const e = {
      stopPropagation: () => {}
    }
    instance.handleToggleEdit(e)
    expect(instance.state.readOnly).toBe(false)
  })

  it('<ViewEquipment />', () => {
    const tree = ViewEquipment(
      { equipment: eqs[0], outletName: 'O1', onStateChange: () => true, onDelete: () => true, onEdit: () => true }
    )
    expect(tree.type).toBe('div')
  })

  it('<ViewEquipment /> off', () => {
    const tree = ViewEquipment(
      { equipment: { ...eqs[0], on: false }, outletName: 'O1', onStateChange: () => true, onDelete: () => true, onEdit: () => true }
    )
    expect(tree.type).toBe('div')
  })

  it('<ViewEquipment /> should toggle state', () => {
    const onStateChange = jest.fn()
    const tree = ViewEquipment({
      onStateChange,
      equipment: eqs[0],
      outletName: 'O1',
      onDelete: () => true,
      onEdit: () => true
    })
    const toggle = findFirst(tree, child => child.props && typeof child.props.onClick === 'function' && child.props.on === true)

    click(toggle)
    expect(onStateChange).toHaveBeenCalledWith('1', {
      name: 'Foo',
      on: false,
      outlet: '1',
      stay_off_on_boot: undefined
    })
  })

  it('<EditEquipment />', () => {
    const unsortedOutlets = [
      { id: '1', name: 'Outlet B' },
      { id: '2', name: 'Outlet A' }
    ]
    const tree = EditEquipment({
      actionLabel: 'save',
      values: { id: 1, name: '', outlet: '', stay_off_on_boot: false, boot_delay: 0 },
      errors: {},
      touched: {},
      update: () => true,
      delete: () => true,
      outlets: unsortedOutlets,
      handleBlur: () => true,
      submitForm: () => true,
      handleChange: () => true
    })
    expect(tree.type).toBe('form')
    expect(unsortedOutlets.map(outlet => outlet.name)).toEqual(['Outlet B', 'Outlet A'])
  })

  it('<EditEquipment /> New Item', () => {
    const tree = EditEquipment({
      actionLabel: 'save',
      values: { id: null, name: '', outlet: '', stay_off_on_boot: false, boot_delay: 0 },
      errors: {},
      touched: {},
      update: () => true,
      delete: () => true,
      outlets: [{ id: '1', name: 'O1' }],
      handleBlur: () => true,
      submitForm: () => true,
      handleChange: () => true
    })
    expect(tree.type).toBe('form')
  })

  it('<EditEquipment /> should submit', () => {
    const submitForm = jest.fn()
    const tree = EditEquipment({
      actionLabel: 'save',
      values: { id: null, name: '', outlet: '', stay_off_on_boot: false, boot_delay: 0 },
      errors: {},
      touched: {},
      update: () => true,
      delete: () => true,
      handleBlur: () => true,
      submitForm,
      handleChange: () => true,
      isValid: true,
      dirty: true,
      outlets: [{ id: '1', name: 'O1' }]
    })
    tree.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditEquipment /> should show alert when invalid', () => {
    const submitForm = jest.fn()
    const tree = EditEquipment({
      actionLabel: 'save',
      values: { id: null, name: '', outlet: '', stay_off_on_boot: false, boot_delay: 0 },
      errors: {},
      touched: {},
      update: () => true,
      delete: () => true,
      handleBlur: () => true,
      submitForm,
      handleChange: () => true,
      isValid: false,
      dirty: true,
      outlets: [{ id: '1', name: 'O1' }]
    })
    tree.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EquipmentForm />', () => {
    const html = renderToStaticMarkup(
      <EquipmentForm
        actionLabel='save'
        values={{ id: null }}
        update={() => true}
        delete={() => true}
        handleBlur={() => true}
        onSubmit={() => true}
        isValid={false}
        outlets={[{ id: '1', name: 'O1' }]}
      />
    )
    expect(html).toContain('smoke-equipment-name')
  })

  it('<Chart />', () => {
    jest.useFakeTimers()
    const fetchEquipment = jest.fn()
    const equipment = [
      { id: '1', outlet: '1', name: 'Foo', on: true },
      { id: '2', outlet: '2', name: 'Bar', on: false }
    ]
    const originalEquipment = equipment.map(eq => ({ ...eq }))
    const component = new RawEquipmentChart({ equipment, fetchEquipment, height: 200 })

    component.componentDidMount()

    expect(fetchEquipment).toHaveBeenCalled()
    const rendered = component.render()
    expect(rendered.props.className).toBe('container')
    const chart = rendered.props.children[1].props.children
    expect(chart.props.data).toEqual([
      { id: '1', outlet: '1', name: 'Foo', on: true, onstate: 1, offstate: undefined },
      { id: '2', outlet: '2', name: 'Bar', on: false, onstate: undefined, offstate: 1 }
    ])
    expect(equipment).toEqual(originalEquipment)
    component.componentWillUnmount()
    jest.useRealTimers()
  })

  it('<Chart />', () => {
    const component = new RawEquipmentChart({ equipment: undefined, fetchEquipment: jest.fn(), height: 200 })
    expect(component.render().type).toBe('div')
  })
})
