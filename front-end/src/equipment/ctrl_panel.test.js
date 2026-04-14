import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import EquipmentCtrlPanel, { CtrlPanelView } from './ctrl_panel'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

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
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('renders without throwing with equipment', () => {
    expect(() => renderToStaticMarkup(
      <CtrlPanelView equipment={equipment} outlets={outlets} fetchEquipment={() => {}} updateEquipment={() => {}} />
    )).not.toThrow()
  })

  it('renders without throwing with undefined equipment', () => {
    expect(() => renderToStaticMarkup(
      <CtrlPanelView equipment={undefined} outlets={[]} fetchEquipment={() => {}} updateEquipment={() => {}} />
    )).not.toThrow()
  })

  it('polls and toggles equipment state', () => {
    jest.useFakeTimers()
    const fetchEquipment = jest.fn()
    const updateEquipment = jest.fn()
    const view = new CtrlPanelView({ equipment, outlets, fetchEquipment, updateEquipment })
    view.componentDidMount()
    expect(fetchEquipment).not.toHaveBeenCalled()
    view.toggleState({ preventDefault: jest.fn() }, equipment[0])
    expect(updateEquipment).toHaveBeenCalledWith(1, {
      id: '1',
      name: 'Heater',
      on: false,
      outlet: '1',
      stay_off_on_boot: false
    })
    view.componentWillUnmount()
    jest.useRealTimers()
    expect(EquipmentCtrlPanel).toBeDefined()
  })

  it('renders connected control labels', () => {
    const html = renderToStaticMarkup(
      <CtrlPanelView equipment={equipment} outlets={outlets} fetchEquipment={() => {}} updateEquipment={() => {}} />
    )
    expect(html).toContain('Heater')
    expect(html).toContain('Pump')
  })
})
