import React from 'react'
import fetchMock from 'fetch-mock'
import Main, { RawInstancesMain } from './main'
import Instance from './instance'
import InstanceForm, {
  mapInstancePropsToValues,
  submitInstanceForm
} from './instance_form'
import EditInstance from './edit_instance'
import { confirm } from 'utils/confirm'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockImplementation(() => Promise.resolve(true))
}))

const instanceData = { id: '1', name: 'Remote Tank', address: 'http://192.168.1.10', user: 'reef-pi', password: 'reef-pi' }
const fn = jest.fn()

const countByType = (node, predicate) => {
  if (!node || typeof node !== 'object') {
    return 0
  }

  let count = predicate(node) ? 1 : 0
  const children = React.Children.toArray(node.props?.children)
  children.forEach(child => {
    count += countByType(child, predicate)
  })
  return count
}

const findNode = (node, predicate) => {
  if (!node || typeof node !== 'object') {
    return null
  }
  if (predicate(node)) {
    return node
  }
  const children = React.Children.toArray(node.props?.children)
  for (const child of children) {
    const found = findNode(child, predicate)
    if (found) {
      return found
    }
  }
  return null
}

describe('Instances Main', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('renders with instance list and fetches on mount', () => {
    const fetch = jest.fn()
    const create = jest.fn()
    const update = jest.fn()
    const remove = jest.fn()
    const main = new RawInstancesMain({
      instances: [instanceData],
      fetch,
      create,
      update,
      delete: remove
    })

    main.componentDidMount()
    expect(fetch).toHaveBeenCalled()

    const rendered = main.render()
    expect(countByType(rendered, node => node.type === Instance)).toBe(1)
  })

  it('renders with empty instance list', () => {
    const main = new RawInstancesMain({
      instances: [],
      fetch: fn,
      create: fn,
      update: fn,
      delete: fn
    })

    const rendered = main.render()
    expect(countByType(rendered, node => node.type === Instance)).toBe(0)
  })

  it('toggles add form via handler', () => {
    const main = new RawInstancesMain({
      instances: [],
      fetch: fn,
      create: fn,
      update: fn,
      delete: fn
    })
    main.setState = jest.fn(update => {
      main.state = { ...main.state, ...update }
    })

    main.handleToggle()
    expect(main.state.add).toBe(true)
    expect(countByType(main.render(), node => node.type === InstanceForm)).toBe(1)

    main.handleToggle()
    expect(main.state.add).toBe(false)
  })
})

describe('Instance', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders in readOnly mode by default', () => {
    const instance = new Instance({
      instance: instanceData,
      update: fn,
      delete: fn
    })

    expect(instance.state.readOnly).toBe(true)
  })

  it('switches to edit mode on toggleEdit', () => {
    const instance = new Instance({
      instance: instanceData,
      update: fn,
      delete: fn
    })
    instance.setState = jest.fn(update => {
      instance.state = { ...instance.state, ...update }
    })

    instance.handleToggleEdit({ stopPropagation: fn })
    expect(instance.state.readOnly).toBe(false)
  })

  it('calls delete prop after confirm', async () => {
    const deleteFn = jest.fn()
    const instance = new Instance({
      instance: instanceData,
      update: fn,
      delete: deleteFn
    })

    await instance.handleDelete({ stopPropagation: fn })
    await Promise.resolve()

    expect(confirm).toHaveBeenCalled()
    expect(deleteFn).toHaveBeenCalledWith(instanceData.id)
  })
})

describe('InstanceForm (withFormik)', () => {
  it('maps create form values without instance prop', () => {
    expect(mapInstancePropsToValues({ remove: false })).toEqual({
      name: '',
      id: '',
      address: '',
      user: '',
      password: '',
      ignore_https: false,
      remove: false
    })
  })

  it('maps edit form values with instance prop and submits', () => {
    expect(mapInstancePropsToValues({ instance: instanceData })).toEqual({
      name: instanceData.name,
      id: instanceData.id,
      address: instanceData.address,
      user: instanceData.user,
      password: instanceData.password,
      ignore_https: false,
      remove: undefined
    })

    const onSubmit = jest.fn()
    submitInstanceForm(instanceData, { onSubmit })
    expect(onSubmit).toHaveBeenCalledWith(instanceData)
    expect(Main).toBeDefined()
  })
})

describe('EditInstance', () => {
  const baseProps = {
    values: { name: 'Tank', address: 'http://1.2.3.4', user: 'reef-pi', password: 'reef-pi', id: '1' },
    errors: {},
    touched: {},
    handleBlur: fn,
    handleChange: fn,
    submitForm: fn,
    onDelete: fn,
    actionLabel: 'Save',
    dirty: true,
    isValid: true
  }

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
    jest.spyOn(Alert, 'showUpdateSuccessful')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields', () => {
    const element = EditInstance(baseProps)
    expect(element.type).toBe('form')
  })

  it('submits when valid', () => {
    const submitForm = jest.fn()
    const element = EditInstance({ ...baseProps, submitForm })
    element.props.onSubmit({ preventDefault: fn })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
  })

  it('submits to show errors when dirty and invalid', () => {
    const submitForm = jest.fn()
    const element = EditInstance({ ...baseProps, submitForm, dirty: true, isValid: false })
    element.props.onSubmit({ preventDefault: fn })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('does not show delete button when id is absent', () => {
    const props = { ...baseProps, values: { ...baseProps.values, id: undefined } }
    const element = EditInstance(props)
    expect(findNode(element, node => node.type === 'button' && node.props.type === 'button')).toBeNull()
  })
})
