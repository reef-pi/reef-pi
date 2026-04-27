import React from 'react'
import { RawATOMain } from './main'
import 'isomorphic-fetch'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockImplementation(() => Promise.resolve(true))
}))

const ato = {
  id: '1', name: 'Top-off', enable: true,
  inlet: 'inlet1', period: 60, debounce: 0,
  control: true, pump: { id: 'pump1' },
  sensor: { readings: [] }
}
const equipment = [{ id: 'pump1', name: 'ATO Pump' }]
const inlets = [{ id: 'inlet1', name: 'Float Switch' }]
const macros = []

describe('ATO Main', () => {
  const makeProps = (extra = {}) => ({
    atos: [ato],
    equipment,
    inlets,
    macros,
    fetchATOs: jest.fn(),
    fetchEquipment: jest.fn(),
    fetchInlets: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    reset: jest.fn(),
    ...extra
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetches ATO dependencies on mount', () => {
    const props = makeProps()
    const component = new RawATOMain(props)

    component.componentDidMount()

    expect(props.fetchATOs).toHaveBeenCalled()
    expect(props.fetchEquipment).toHaveBeenCalled()
    expect(props.fetchInlets).toHaveBeenCalled()
  })

  it('renders a collapsible entry for each ATO', () => {
    const component = new RawATOMain(makeProps())
    const panels = component.probeList()

    expect(panels).toHaveLength(1)
    expect(panels[0].props.name).toBe('panel-ato-1')
  })

  it('renders with an empty ATO list', () => {
    const component = new RawATOMain(makeProps({ atos: [] }))
    const panels = component.probeList()

    expect(panels).toHaveLength(0)
  })

  it('renders the add-new section', () => {
    const component = new RawATOMain(makeProps())
    const tree = component.render()
    const list = tree.props.children

    expect(list.type).toBe('ul')
    expect(list.props.children).toHaveLength(2)
  })
})
