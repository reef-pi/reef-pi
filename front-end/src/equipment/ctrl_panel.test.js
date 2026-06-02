import React from 'react'
import { render, screen } from '@testing-library/react'
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
    window.FEATURE_FLAGS = {}
  })

  it('renders without throwing with equipment', () => {
    const panel = new RawEquipmentCtrlPanel({
      equipment,
      outlets,
      fetchEquipment: jest.fn()
    })
    expect(() => panel.render()).not.toThrow()
    expect(EquipmentCtrlPanel).toBeDefined()
  })

  it('renders without throwing with undefined equipment', () => {
    const panel = new RawEquipmentCtrlPanel({
      equipment: undefined,
      outlets: [],
      fetchEquipment: jest.fn()
    })
    expect(panel.render().type).toBe('div')
  })

  it('starts polling on mount and clears interval on unmount', () => {
    jest.useFakeTimers()
    const fetchEquipment = jest.fn()
    const panel = new RawEquipmentCtrlPanel({
      equipment,
      outlets,
      fetchEquipment
    })
    panel.componentDidMount()
    jest.advanceTimersByTime(16000)
    panel.componentWillUnmount()
    jest.useRealTimers()
    expect(fetchEquipment).toHaveBeenCalled()
  })

  it('always renders a ToggleSwitch per equipment item', () => {
    const dispatch = jest.fn()
    render(
      <RawEquipmentCtrlPanel
        equipment={equipment}
        outlets={outlets}
        fetchEquipment={jest.fn()}
        dispatch={dispatch}
      />
    )
    const switches = screen.getAllByRole('switch')
    expect(switches).toHaveLength(2)
  })

  it('maps state and dispatch props for the connected control panel', () => {
    expect(mapStateToProps({ equipment, outlets })).toEqual({ equipment, outlets })
    const dispatch = jest.fn(action => action)
    const props = mapDispatchToProps(dispatch)
    props.fetchEquipment()
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('renders ToggleSwitch per item', () => {
    const dispatch = jest.fn()
    render(
      <RawEquipmentCtrlPanel
        equipment={equipment}
        outlets={outlets}
        fetchEquipment={jest.fn()}
        dispatch={dispatch}
      />
    )
    const switches = screen.getAllByRole('switch')
    expect(switches).toHaveLength(2)
  })

  it('PendingEquipmentToggle receives id and name from useEquipmentToggle', () => {
    const { useEquipmentToggle } = require('../../design-system/ui_kits/reef-pi-app/hooks/useEquipmentToggle')
    const dispatch = jest.fn()
    render(
      <RawEquipmentCtrlPanel
        equipment={[equipment[0]]}
        outlets={outlets}
        fetchEquipment={jest.fn()}
        dispatch={dispatch}
      />
    )
    expect(useEquipmentToggle).toHaveBeenCalledWith(
      expect.objectContaining({ id: equipment[0].id, name: equipment[0].name })
    )
  })
})
