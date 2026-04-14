import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Equipment from './equipment'
import ViewEquipment from './view_equipment'
import EditEquipment from './edit_equipment'
import EquipmentForm from './equipment_form'
import EquipmentChart, { ChartView } from './chart'
import Main, { MainView } from './main'
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
describe('Equipment ui', () => {
  const eqs = [{ id: '1', outlet: '1', name: 'Foo', on: true }]
  const outlets = [{ id: '1', name: 'O1' }]

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<MainView /> renders, fetches, sorts, and toggles add form', () => {
    const fetch = jest.fn()
    const fetchOutlets = jest.fn()
    const create = jest.fn()
    const view = new MainView({ equipment: eqs, outlets, fetch, fetchOutlets, create })
    view.setState = jest.fn(update => {
      view.state = { ...view.state, ...update }
    })

    view.componentDidMount()
    expect(fetch).toHaveBeenCalled()
    expect(fetchOutlets).toHaveBeenCalled()
    expect(() => renderToStaticMarkup(<MainView equipment={eqs} outlets={outlets} fetch={fetch} fetchOutlets={fetchOutlets} create={create} />)).not.toThrow()

    view.handleSortChange({ target: { value: SORT_NAME_ZA } })
    expect(view.state.sortMode).toBe(SORT_NAME_ZA)

    view.handleToggleAddEquipmentDiv()
    expect(view.state.addEquipment).toBe(true)
    view.handleAddEquipment({ name: 'Pump', outlet: '1' })
    expect(create).toHaveBeenCalledWith({ name: 'Pump', outlet: '1' })
    expect(view.state.addEquipment).toBe(false)
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
      stay_off_on_boot: undefined
    })
  })

  it('<Equipment />', () => {
    const equipment = new Equipment({ equipment: eqs[0], update: () => Promise.resolve(true), delete: () => true, outlets })
    expect(equipment.selectedOutlet().name).toBe('O1')
    expect(() => renderToStaticMarkup(<Equipment equipment={eqs[0]} update={() => Promise.resolve(true)} delete={() => true} outlets={outlets} />)).not.toThrow()
  })

  it('should handle delete', async () => {
    const del = jest.fn()
    const instance = new Equipment({ equipment: eqs[0], update: () => Promise.resolve(true), delete: del, outlets })
    const ev = {
      stopPropagation: () => {}
    }
    instance.handleDelete(ev)
    await Promise.resolve()
    expect(del).toHaveBeenCalledWith('1')
  })

  it('should handle submit', async () => {
    const update = jest.fn(() => Promise.resolve(true))
    const instance = new Equipment({ equipment: eqs[0], update, delete: () => true, outlets })
    instance.setState = jest.fn(updateState => {
      instance.state = { ...instance.state, ...updateState }
    })
    const values = {
      id: 1,
      name: 'test',
      outlet: 3,
      on: false,
      stay_off_on_boot: true
    }
    instance.handleSubmit(values)
    await Promise.resolve()
    expect(update).toHaveBeenCalledWith(1, {
      name: 'test',
      outlet: 3,
      on: false,
      stay_off_on_boot: true
    })
    expect(instance.state.readOnly).toBe(true)
  })

  it('should handle an unrecognized outlet', () => {
    const equipment = new Equipment({ equipment: eqs[0], update: () => Promise.resolve(true), delete: () => true, outlets: [{ id: '2', name: 'O1' }] })
    expect(equipment.selectedOutlet()).toEqual({ name: '' })
  })

  it('should toggle edit', () => {
    const instance = new Equipment({ equipment: eqs[0], update: () => Promise.resolve(true), delete: () => true, outlets: [{ id: '2', name: 'O1' }] })
    instance.setState = jest.fn(update => {
      instance.state = { ...instance.state, ...update }
    })

    const e = {
      stopPropagation: () => {}
    }
    instance.handleToggleEdit(e)
    expect(instance.state.readOnly).toBe(false)
  })

  it('<ViewEquipment />', () => {
    expect(() => renderToStaticMarkup(
      <ViewEquipment equipment={eqs[0]} outletName='O1' onStateChange={() => true} onDelete={() => true} onEdit={() => true} />
    )).not.toThrow()
  })

  it('<ViewEquipment /> off', () => {
    const eq = { ...eqs[0], on: false }
    expect(renderToStaticMarkup(
      <ViewEquipment equipment={eq} outletName='O1' onStateChange={() => true} onDelete={() => true} onEdit={() => true} />
    )).toContain('O1')
  })

  it('<ViewEquipment /> should toggle state', () => {
    const onStateChange = jest.fn()
    const element = ViewEquipment(
      {
        onStateChange,
        equipment: eqs[0],
        onDelete: () => true,
        onEdit: () => true,
        outletName: 'O1'
      }
    )
    element.props.children[2].props.children.props.onClick()
    expect(onStateChange).toHaveBeenCalledWith('1', {
      name: 'Foo',
      on: false,
      outlet: '1',
      stay_off_on_boot: undefined
    })
  })

  it('<EditEquipment />', () => {
    expect(() => renderToStaticMarkup(
      <EditEquipment
        actionLabel='save'
        values={{ id: 1, name: 'Foo', outlet: '1', stay_off_on_boot: false }}
        errors={{}}
        touched={{}}
        outlets={[{ id: '1', name: 'O1' }]}
        handleBlur={() => true}
        handleChange={() => true}
        submitForm={() => true}
      />
    )).not.toThrow()
  })

  it('<EditEquipment /> New Item', () => {
    expect(() => renderToStaticMarkup(
      <EditEquipment
        actionLabel='save'
        values={{ id: null, name: '', outlet: '', stay_off_on_boot: false }}
        errors={{}}
        touched={{}}
        outlets={[{ id: '1', name: 'O1' }]}
        handleBlur={() => true}
        handleChange={() => true}
        submitForm={() => true}
      />
    )).not.toThrow()
  })

  it('<EditEquipment /> should submit', () => {
    const submitForm = jest.fn()
    const element = EditEquipment(
      {
        actionLabel: 'save',
        values: { id: null, name: '', outlet: '', stay_off_on_boot: false },
        errors: {},
        touched: {},
        outlets: [{ id: '1', name: 'O1' }],
        handleBlur: () => true,
        handleChange: () => true,
        submitForm,
        isValid: true,
        dirty: true
      }
    )
    element.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditEquipment /> should show alert when invalid', () => {
    const submitForm = jest.fn()
    const element = EditEquipment(
      {
        actionLabel: 'save',
        values: { id: null, name: '', outlet: '', stay_off_on_boot: false },
        errors: {},
        touched: {},
        outlets: [{ id: '1', name: 'O1' }],
        handleBlur: () => true,
        handleChange: () => true,
        submitForm,
        isValid: false,
        dirty: true
      }
    )
    element.props.onSubmit({ preventDefault: () => {} })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EquipmentForm />', () => {
    expect(() => renderToStaticMarkup(
      <EquipmentForm
        actionLabel='save'
        onSubmit={() => true}
        outlets={[{ id: '1', name: 'O1' }]}
      />
    )).not.toThrow()
  })

  it('<ChartView /> renders and polls', () => {
    jest.useFakeTimers()
    const fetchEquipment = jest.fn()
    const chart = new ChartView({ equipment: eqs, fetchEquipment, height: 100 })
    chart.componentDidMount()
    expect(fetchEquipment).toHaveBeenCalled()
    expect(() => renderToStaticMarkup(<ChartView equipment={eqs} fetchEquipment={fetchEquipment} height={100} />)).not.toThrow()
    chart.componentWillUnmount()
    jest.useRealTimers()
    expect(EquipmentChart).toBeDefined()
  })

  it('<ChartView /> handles missing equipment', () => {
    const chart = new ChartView({ fetchEquipment: jest.fn() })
    expect(() => renderToStaticMarkup(chart.render())).not.toThrow()
  })
})
