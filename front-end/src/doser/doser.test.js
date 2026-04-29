import Main, { RawDoser } from './main'
import 'isomorphic-fetch'
import DoserForm, { mapDoserPropsToValues, submitDoserForm } from './doser_form'

jest.mock('utils/confirm', () => ({
  showModal: jest.fn(),
  confirm: jest.fn(() => Promise.resolve(true))
}))

describe('Doser ui', () => {
  it('<Main /> toggles and maps payloads', () => {
    const component = new RawDoser({
      dosers: [{ id: 1, name: 'doser', regiment: { enable: false, schedule: {} } }],
      jacks: [],
      outlets: [],
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      calibrateDoser: jest.fn(),
      saveCalibration: jest.fn()
    })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })

    expect(Main).toBeDefined()
    expect(component.state.addDoser).toBe(false)
    component.handleToggleAddDoserDiv()
    expect(component.state.addDoser).toBe(true)

    expect(component.valuesToDoser({
      name: 'name',
      jack: '1',
      pin: '2',
      stepper: { step: 10 },
      type: 'stepper',
      volume: '3.5',
      volume_per_second: '1.5',
      enable: true,
      duration: '10',
      speed: '20',
      month: '*',
      week: '*',
      day: '*',
      hour: '17',
      minute: '0',
      second: '0'
    })).toEqual({
      name: 'name',
      jack: '1',
      pin: 2,
      stepper: { step: 10 },
      type: 'stepper',
      regiment: {
        volume: 3.5,
        volume_per_second: 1.5,
        enable: true,
        duration: 10,
        speed: 20,
        schedule: {
          month: '*',
          week: '*',
          day: '*',
          hour: '17',
          minute: '0',
          second: '0'
        }
      }
    })
  })

  it('<DoserForm/> maps defaults and submits', () => {
    const onSubmit = jest.fn()

    expect(mapDoserPropsToValues({})).toEqual({
      id: '',
      name: '',
      jack: '',
      pin: '',
      enable: true,
      continuous: false,
      soft_start: 0,
      duration: 0,
      volume: 0,
      speed: 0,
      volume_per_second: 0,
      month: '*',
      week: '*',
      day: '*',
      hour: '0',
      minute: '0',
      second: '0',
      type: '',
      stepper: {}
    })

    submitDoserForm({ id: '1' }, { onSubmit })
    expect(onSubmit).toHaveBeenCalledWith({ id: '1' })
    expect(DoserForm).toBeDefined()
  })

  it('<DoserForm /> maps edit values', () => {
    const doser = {
      name: 'name',
      regiment: {
        enable: true,
        schedule: {
          day: '*',
          hour: '17',
          minute: '0',
          second: '0'
        }
      }
    }

    expect(mapDoserPropsToValues({ doser })).toMatchObject({
      name: 'name',
      enable: true,
      day: '*',
      hour: '17',
      minute: '0',
      second: '0'
    })
  })

  const makeDoser = (overrides = {}) => ({
    id: '1',
    name: 'doser',
    jack: 'j1',
    pin: 0,
    stepper: {},
    type: 'peristaltic',
    regiment: { enable: true, schedule: {} },
    ...overrides
  })

  const makeComponent = (extra = {}) => {
    const component = new RawDoser({
      dosers: [makeDoser()],
      jacks: [],
      outlets: [],
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      calibrateDoser: jest.fn(),
      saveCalibration: jest.fn(),
      ...extra
    })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })
    return component
  }

  it('<Main /> doserList renders one entry per doser', () => {
    const component = makeComponent()
    const items = component.doserList()
    expect(items).toHaveLength(1)
    expect(items[0].props.name).toBe('panel-doser-1')
  })

  it('<Main /> doserList toggle enable calls update', () => {
    const update = jest.fn()
    const component = makeComponent({ update })
    const items = component.doserList()
    items[0].props.onToggleState()
    expect(update).toHaveBeenCalledWith('1', expect.objectContaining({ regiment: expect.objectContaining({ enable: false }) }))
  })

  it('<Main /> handleUpdateDoser calls update with normalized payload', () => {
    const update = jest.fn()
    const component = makeComponent({ update })
    component.handleUpdateDoser({
      id: '1', name: 'n', jack: 'j1', pin: '2', stepper: {}, type: 't',
      volume: '1.5', volume_per_second: '0.5', enable: true,
      duration: '10', speed: '100',
      month: '*', week: '*', day: '*', hour: '0', minute: '0', second: '0'
    })
    expect(update).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'n', pin: 2 }))
  })

  it('<Main /> handleCreateDoser calls create and toggles form closed', () => {
    const create = jest.fn()
    const component = makeComponent({ create, dosers: [] })
    component.state.addDoser = true
    component.handleCreateDoser({
      name: 'n', jack: 'j1', pin: '0', stepper: {}, type: 't',
      volume: '1', volume_per_second: '0', enable: true,
      duration: '5', speed: '50',
      month: '*', week: '*', day: '*', hour: '0', minute: '0', second: '0'
    })
    expect(create).toHaveBeenCalled()
    expect(component.state.addDoser).toBe(false)
  })

  it('<Main /> handleDeleteDoser calls confirm then delete', async () => {
    const del = jest.fn()
    const component = makeComponent({ delete: del })
    component.handleDeleteDoser(makeDoser())
    await Promise.resolve()
    expect(del).toHaveBeenCalledWith('1')
  })

  it('<Main /> calibrateDoser calls showModal', () => {
    const { showModal: mockShowModal } = require('utils/confirm')
    const component = makeComponent()
    component.calibrateDoser({ stopPropagation: jest.fn() }, makeDoser())
    expect(mockShowModal).toHaveBeenCalled()
  })

  it('<Main /> render shows add form when addDoser is true', () => {
    const component = makeComponent()
    component.state = { addDoser: true }
    const tree = component.render()
    expect(tree).not.toBeNull()
  })
})
