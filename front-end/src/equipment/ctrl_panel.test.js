import React from 'react'
import { render, screen } from '@testing-library/react'
import Switch from 'react-toggle-switch'
import EquipmentCtrlPanel, { RawEquipmentCtrlPanel, mapDispatchToProps, mapStateToProps } from './ctrl_panel'
import 'isomorphic-fetch'

jest.mock('../../design-system/ui_kits/reef-pi-app/hooks/useEquipmentToggle', () => ({
  useEquipmentToggle: jest.fn(() => ({ mutate: jest.fn(), state: 'idle', retry: jest.fn() }))
}))

const equipment = [
  { id: '1', name: 'Heater', on: true, outlet: '1', stay_off_on_boot: false },
  { id: '2', name: 'Pump', on: false, outlet: '2', stay_off_on_boot: true }
]
const outlets = [
  { id: '1', name: 'O1' },
  { id: '2', name: 'O2' }
]

describe('<EquipmentCtrlPanel />', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without throwing with equipment', () => {
    const panel = new RawEquipmentCtrlPanel({
      equipment,
      outlets,
      fetchEquipment: jest.fn(),
      updateEquipment: jest.fn()
    })
    expect(() => panel.render()).not.toThrow()
    expect(EquipmentCtrlPanel).toBeDefined()
  })

  it('renders without throwing with undefined equipment', () => {
    const panel = new RawEquipmentCtrlPanel({
      equipment: undefined,
      outlets: [],
      fetchEquipment: jest.fn(),
      updateEquipment: jest.fn()
    })
    expect(panel.render().type).toBe('div')
  })

  it('starts polling on mount and clears interval on unmount', () => {
    jest.useFakeTimers()
    const fetchEquipment = jest.fn()
    const panel = new RawEquipmentCtrlPanel({
      equipment,
      outlets,
      fetchEquipment,
      updateEquipment: jest.fn()
    })
    panel.componentDidMount()
    jest.advanceTimersByTime(16000)
    panel.componentWillUnmount()
    jest.useRealTimers()
    expect(fetchEquipment).toHaveBeenCalled()
  })

  it('toggles equipment state', () => {
    const updateEquipment = jest.fn()
    const panel = new RawEquipmentCtrlPanel({
      equipment,
      outlets,
      fetchEquipment: jest.fn(),
      updateEquipment
    })
    const preventDefault = jest.fn()
    panel.toggleState({ preventDefault }, equipment[0])
    expect(preventDefault).toHaveBeenCalled()
    expect(updateEquipment).toHaveBeenCalled()
  })

  it('renders sorted switches with toggle handlers', () => {
    const panel = new RawEquipmentCtrlPanel({
      equipment: [equipment[1], equipment[0]],
      outlets,
      fetchEquipment: jest.fn(),
      updateEquipment: jest.fn()
    })

    const switches = panel.render().props.children.props.children
      .map(col => col.props.children.props.children[0])

    expect(switches).toHaveLength(2)
    expect(switches[0].type).toBe(Switch)
    expect(switches[0].props.on).toBe(true)
    expect(switches[1].props.on).toBe(false)
  })

  it('maps state and dispatch props for the connected control panel', () => {
    expect(mapStateToProps({ equipment, outlets })).toEqual({ equipment, outlets })
    const dispatch = jest.fn(action => action)
    const props = mapDispatchToProps(dispatch)
    props.fetchEquipment()
    props.updateEquipment(1, { on: false })
    expect(dispatch).toHaveBeenCalledTimes(2)
  })

  it('renders ToggleSwitch per item when pending_states flag is enabled', () => {
    window.FEATURE_FLAGS = { pending_states: true }
    const dispatch = jest.fn()
    render(
      <RawEquipmentCtrlPanel
        equipment={equipment}
        outlets={outlets}
        fetchEquipment={jest.fn()}
        updateEquipment={jest.fn()}
        dispatch={dispatch}
      />
    )
    const switches = screen.getAllByRole('switch')
    expect(switches).toHaveLength(2)
    window.FEATURE_FLAGS = {}
  })

  it('PendingEquipmentToggle receives id and name from useEquipmentToggle', () => {
    const { useEquipmentToggle } = require('../../design-system/ui_kits/reef-pi-app/hooks/useEquipmentToggle')
    window.FEATURE_FLAGS = { pending_states: true }
    const dispatch = jest.fn()
    render(
      <RawEquipmentCtrlPanel
        equipment={[equipment[0]]}
        outlets={outlets}
        fetchEquipment={jest.fn()}
        updateEquipment={jest.fn()}
        dispatch={dispatch}
      />
    )
    expect(useEquipmentToggle).toHaveBeenCalledWith(
      expect.objectContaining({ id: equipment[0].id, name: equipment[0].name })
    )
    window.FEATURE_FLAGS = {}
  })
})
