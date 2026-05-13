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

const findAll = (node, predicate, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (predicate(node)) {
    acc.push(node)
  }
  const children = React.Children.toArray(node.props?.children)
  children.forEach(child => findAll(child, predicate, acc))
  return acc
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
    const instances = [
      { ...instanceData, id: '2', name: 'Remote Tank B' },
      { ...instanceData, id: '1', name: 'Remote Tank A' }
    ]
    const main = new RawInstancesMain({
      instances,
      fetch,
      create,
      update,
      delete: remove
    })

    main.componentDidMount()
    expect(fetch).toHaveBeenCalled()

    const rendered = main.render()
    const renderedInstances = findAll(rendered, node => node.type === Instance)
    expect(renderedInstances).toHaveLength(2)
    expect(renderedInstances.map(node => node.props.instance.name)).toEqual(['Remote Tank B', 'Remote Tank A'])
    expect(instances.map(instance => instance.name)).toEqual(['Remote Tank B', 'Remote Tank A'])
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

  it('creates instances with normalized payload and closes add form', () => {
    const create = jest.fn()
    const main = new RawInstancesMain({
      instances: [],
      fetch: fn,
      create,
      update: fn,
      delete: fn
    })
    main.state = { add: true }
    main.setState = jest.fn(update => {
      main.state = { ...main.state, ...update }
    })
    main.toggle = () => main.handleToggle()

    main.handleCreate({
      id: '99',
      name: 'Frag Tank',
      address: 'https://frag.local',
      user: 'admin',
      password: 'secret',
      ignore_https: true,
      remove: true
    })

    expect(create).toHaveBeenCalledWith({
      name: 'Frag Tank',
      address: 'https://frag.local',
      user: 'admin',
      password: 'secret',
      ignore_https: true
    })
    expect(main.state.add).toBe(false)
  })

  it('renders add form with submit action label when add is true', () => {
    const main = new RawInstancesMain({
      instances: [],
      fetch: fn,
      create: fn,
      update: fn,
      delete: fn
    })
    main.state = { add: true }

    const rendered = main.render()
    const form = findNode(rendered, node => node.type === InstanceForm)

    expect(form).not.toBeNull()
    expect(form.props.onSubmit).toBe(main.handleCreate)
    expect(form.props.actionLabel).toBe('save')
  })

  it('renders add button value from add state', () => {
    const main = new RawInstancesMain({
      instances: [],
      fetch: fn,
      create: fn,
      update: fn,
      delete: fn
    })

    let addButton = findNode(main.render(), node => node.type === 'input' && node.props.id === 'add_instance')
    expect(addButton.props.value).toBe('+')

    main.state = { add: true }
    addButton = findNode(main.render(), node => node.type === 'input' && node.props.id === 'add_instance')
    expect(addButton.props.value).toBe('-')
  })

  it('renders instances sorted by numeric id descending', () => {
    const main = new RawInstancesMain({
      instances: [
        { ...instanceData, id: '2', name: 'Second' },
        { ...instanceData, id: '10', name: 'Tenth' },
        { ...instanceData, id: '1', name: 'First' }
      ],
      fetch: fn,
      create: fn,
      update: fn,
      delete: fn
    })

    const renderedInstances = findAll(main.render(), node => node.type === Instance)
    expect(renderedInstances.map(node => node.props.instance.id)).toEqual(['10', '2', '1'])
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

  it('maps partial instance data with empty string fallbacks', () => {
    expect(mapInstancePropsToValues({
      instance: {
        id: '2',
        name: 'Backup reef-pi',
        ignore_https: true
      },
      remove: true
    })).toEqual({
      name: 'Backup reef-pi',
      id: '2',
      address: '',
      user: '',
      password: '',
      ignore_https: true,
      remove: true
    })
  })

  it('preserves explicit false ignore_https on edit', () => {
    expect(mapInstancePropsToValues({
      instance: {
        ...instanceData,
        ignore_https: false
      }
    }).ignore_https).toBe(false)
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
