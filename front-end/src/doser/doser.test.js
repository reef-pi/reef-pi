import Main, { RawDoser } from './main'
import 'isomorphic-fetch'
import DoserForm, { mapDoserPropsToValues, submitDoserForm } from './doser_form'

jest.mock('utils/confirm', () => {
  return {
    showModal: jest.fn(),
    confirm: jest.fn(() => Promise.resolve(true))
  }
})

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
})
