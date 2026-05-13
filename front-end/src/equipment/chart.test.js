import EquipmentChart, { RawEquipmentChart } from './chart'
import { Bar, Tooltip, XAxis } from 'recharts'
import { EQUIPMENT_POLL_INTERVAL_MS } from './utils'
import 'isomorphic-fetch'

const equipment = [
  { id: '1', name: 'Return', on: true },
  { id: '2', name: 'Skimmer', on: false }
]

describe('Equipment Chart', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('renders an empty placeholder when equipment is missing', () => {
    const chart = new RawEquipmentChart({
      equipment: undefined,
      height: 200,
      fetchEquipment: jest.fn()
    })

    expect(chart.render().type).toBe('div')
    expect(EquipmentChart).toBeDefined()
  })

  it('renders equipment state bars without mutating source equipment', () => {
    const originalEquipment = equipment.map(item => ({ ...item }))
    const chart = new RawEquipmentChart({
      equipment,
      height: 180,
      fetchEquipment: jest.fn()
    })
    const rendered = chart.render()
    const responsiveContainer = rendered.props.children[1]
    const barChart = responsiveContainer.props.children
    const [onBar, offBar, xAxis, tooltip] = barChart.props.children

    expect(rendered.props.children[0].props.children).toBe('equipment')
    expect(responsiveContainer.props).toMatchObject({ height: 180, width: '100%' })
    expect(barChart.props.data).toEqual([
      { id: '1', name: 'Return', on: true, onstate: 1, offstate: undefined },
      { id: '2', name: 'Skimmer', on: false, onstate: undefined, offstate: 1 }
    ])
    expect(equipment).toEqual(originalEquipment)
    expect(onBar.type).toBe(Bar)
    expect(onBar.props).toMatchObject({ dataKey: 'onstate', fill: '#00c851', isAnimationActive: false, stackId: 'a' })
    expect(offBar.type).toBe(Bar)
    expect(offBar.props).toMatchObject({ dataKey: 'offstate', fill: '#ff4444', isAnimationActive: false, stackId: 'a' })
    expect(xAxis.type).toBe(XAxis)
    expect(xAxis.props.dataKey).toBe('name')
    expect(tooltip.type).toBe(Tooltip)
    expect(tooltip.props.content.type.name).toBe('CustomToolTip')
  })

  it('renders tooltip states for missing, on, and off payloads', () => {
    const chart = new RawEquipmentChart({
      equipment,
      height: 180,
      fetchEquipment: jest.fn()
    })
    const tooltipElement = chart.render().props.children[1].props.children.props.children[3].props.content
    const TooltipContent = tooltipElement.type

    expect(new TooltipContent({}).render().type).toBe('span')
    expect(new TooltipContent({ payload: [] }).render().type).toBe('span')
    expect(new TooltipContent({ payload: [{ dataKey: 'onstate' }] }).render().props.children).toBe('on')
    expect(new TooltipContent({ payload: [{ dataKey: 'offstate' }] }).render().props.children).toBe('off')
  })

  it('polls equipment on mount and clears the timer on unmount', () => {
    jest.useFakeTimers()
    const fetchEquipment = jest.fn()
    const chart = new RawEquipmentChart({
      equipment,
      height: 200,
      fetchEquipment
    })

    chart.componentDidMount()
    jest.advanceTimersByTime(EQUIPMENT_POLL_INTERVAL_MS)
    chart.componentWillUnmount()

    expect(fetchEquipment).toHaveBeenCalledTimes(2)
  })
})
