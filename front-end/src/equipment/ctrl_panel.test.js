import EquipmentCtrlPanel, { RawEquipmentCtrlPanel } from './ctrl_panel'
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
})
