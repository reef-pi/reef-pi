import Driver from './driver'
import 'isomorphic-fetch'
import DriverForm, { mapDriverPropsToValues, submitDriverForm } from './driver_form'
import { confirm } from 'utils/confirm'
import { showUpdateSuccessful } from 'utils/alert'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn(() => Promise.resolve())
}))

jest.mock('utils/alert', () => ({
  showUpdateSuccessful: jest.fn()
}))

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

  it('<Driver /> ignores edit when read only', () => {
    const component = new Driver({
      driver,
      read_only: true,
      remove: jest.fn(),
      update: jest.fn(),
      validate: jest.fn(() => Promise.resolve({ status: 200 })),
      provision: jest.fn(),
      driverOptions: {}
    })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })

    component.handleEdit()

    expect(component.state.edit).toBeUndefined()
    expect(component.setState).not.toHaveBeenCalled()
    expect(component.render().props.children[1].props.children).toEqual([null, null, null])
  })

  it('<Driver /> removes after confirmation', () => {
    expect.assertions(2)
    const remove = jest.fn()
    const component = new Driver({
      driver,
      remove,
      update: jest.fn(),
      validate: jest.fn(() => Promise.resolve({ status: 200 })),
      provision: jest.fn(),
      driverOptions: {}
    })

    component.handleRemove(driver)

    expect(confirm).toHaveBeenCalled()
    return Promise.resolve().then(() => expect(remove).toHaveBeenCalledWith(driver.id))
  })

  it('<Driver /> saves valid edits and maps validation errors', () => {
    expect.assertions(5)
    const update = jest.fn()
    const component = new Driver({
      driver,
      remove: jest.fn(),
      update,
      validate: jest.fn(() => Promise.resolve({ status: 200 })),
      provision: jest.fn(),
      driverOptions: {}
    })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })

    component.handleSave({ name: 'new', type: 'pca9685', config: { address: 64 } }, { setErrors: jest.fn() })

    return Promise.resolve()
      .then(() => {
        expect(update).toHaveBeenCalledWith(driver.id, {
          id: driver.id,
          name: 'new',
          type: 'pca9685',
          config: { address: 64 }
        })
        expect(component.state.edit).toBe(false)
        const setErrors = jest.fn()
        const invalid = new Driver({
          driver,
          remove: jest.fn(),
          update: jest.fn(),
          validate: jest.fn(() => Promise.resolve({
            status: 400,
            json: () => Promise.resolve({
              name: 'bad name',
              'config.address': 'bad address'
            })
          })),
          provision: jest.fn(),
          driverOptions: {}
        })
        invalid.handleSave({ name: 'bad', type: 'pca9685', config: {} }, { setErrors })
        return Promise.resolve().then(() => Promise.resolve())
          .then(() => {
            expect(setErrors).toHaveBeenCalledWith({
              name: 'bad name',
              'config.address': 'bad address',
              config: { address: 'bad address' }
            })
            expect(invalid.editUI().type).toBe(DriverForm)
            expect(invalid.ui().props.children).toHaveLength(2)
          })
      })
  })

  it('<Driver /> provisions from render button', () => {
    const provision = jest.fn()
    const component = new Driver({
      driver,
      remove: jest.fn(),
      update: jest.fn(),
      validate: jest.fn(() => Promise.resolve({ status: 200 })),
      provision,
      driverOptions: {}
    })

    const tree = component.render()
    const buttons = tree.props.children[1].props.children
    buttons[2].props.onClick()

    expect(provision).toHaveBeenCalledWith(driver.id)
    expect(showUpdateSuccessful).toHaveBeenCalled()
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
