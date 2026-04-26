import Driver from './driver'
import 'isomorphic-fetch'
import DriverForm, { mapDriverPropsToValues, submitDriverForm } from './driver_form'

describe('driver UI', () => {
  let driver = {
    id: 1,
    name: 'test',
    type: 'pca9685',
    config: {
      address: 45,
      freqency: 1000
    }
  }

  it('<Driver /> toggles edit state', () => {
    const component = new Driver({
      driver,
      remove: jest.fn(),
      update: jest.fn(),
      validate: jest.fn(() => Promise.resolve({ status: 200 })),
      provision: jest.fn(),
      driverOptions: {}
    })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })

    expect(component.ui().type).toBe('div')
    component.handleEdit()
    expect(component.state.edit).toBe(true)
    expect(component.state.lbl).toBe('save')
  })

  it('<DriverForm /> maps and submits', () => {
    const onSubmit = jest.fn()

    expect(mapDriverPropsToValues({ data: driver })).toEqual({
      id: 1,
      name: 'test',
      type: 'pca9685',
      config: {
        address: 45,
        freqency: 1000
      }
    })

    submitDriverForm({ id: 1 }, { props: { onSubmit } })
    expect(onSubmit).toHaveBeenCalledWith({ id: 1 }, { props: { onSubmit } })
    expect(DriverForm).toBeDefined()
  })
})
