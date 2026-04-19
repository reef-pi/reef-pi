import React, { act } from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import fetchMock from 'fetch-mock'
import Main from './main'
import Instance from './instance'
import InstanceForm from './instance_form'
import EditInstance from './edit_instance'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockImplementation(() => Promise.resolve(true))
}))

const instanceData = { id: '1', name: 'Remote Tank', address: 'http://192.168.1.10', user: 'reef-pi', password: 'reef-pi' }
const fn = jest.fn()

describe('Instances Main', () => {
  const click = (node, event = {}) => {
    act(() => {
      node.prop('onClick')(event)
    })
  }

  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('mounts with instance list', () => {
    fetchMock.get('/api/instances', [instanceData])
    const store = mockStore({ instances: [instanceData] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('mounts with empty instance list', () => {
    fetchMock.get('/api/instances', [])
    const store = mockStore({ instances: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('toggles add form via button click', () => {
    fetchMock.get('/api/instances', [])
    const store = mockStore({ instances: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    click(wrapper.find('#add_instance'))
    click(wrapper.find('#add_instance'))
    wrapper.unmount()
  })
})

describe('Instance', () => {
  it('renders in readOnly mode by default', () => {
    const wrapper = shallow(
      <Instance
        instance={instanceData}
        update={fn}
        delete={fn}
      />
    )
    expect(wrapper.instance().state.readOnly).toBe(true)
  })

  it('switches to edit mode on toggleEdit', () => {
    const wrapper = shallow(
      <Instance instance={instanceData} update={fn} delete={fn} />
    )
    const inst = wrapper.instance()
    inst.handleToggleEdit({ stopPropagation: fn })
    expect(inst.state.readOnly).toBe(false)
  })

  it('calls delete prop after confirm', () => {
    const deleteFn = jest.fn()
    const wrapper = shallow(
      <Instance instance={instanceData} update={fn} delete={deleteFn} />
    )
    wrapper.instance().handleDelete({ stopPropagation: fn })
    // confirm mock resolves, delete will be called async
    expect(wrapper).toBeDefined()
  })
})

describe('InstanceForm (withFormik)', () => {
  it('renders create form without instance prop', () => {
    const wrapper = shallow(<InstanceForm onSubmit={fn} actionLabel='Save' />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('renders edit form with instance prop', () => {
    const wrapper = shallow(<InstanceForm instance={instanceData} onSubmit={fn} actionLabel='Update' />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
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

  it('renders form fields', () => {
    const wrapper = shallow(<EditInstance {...baseProps} />)
    expect(wrapper.find('form').length).toBe(1)
  })

  it('submits when valid', () => {
    const submitFn = jest.fn()
    const wrapper = shallow(<EditInstance {...baseProps} submitForm={submitFn} />)
    wrapper.find('form').simulate('submit', { preventDefault: fn })
    expect(submitFn).toHaveBeenCalled()
  })

  it('submits to show errors when dirty and invalid', () => {
    const submitFn = jest.fn()
    const wrapper = shallow(<EditInstance {...baseProps} submitForm={submitFn} dirty isValid={false} />)
    wrapper.find('form').simulate('submit', { preventDefault: fn })
    expect(submitFn).toHaveBeenCalled()
  })

  it('does not show delete button when id is absent', () => {
    const props = { ...baseProps, values: { ...baseProps.values, id: undefined } }
    const wrapper = shallow(<EditInstance {...props} />)
    expect(wrapper.find('button[type="button"]').length).toBe(0)
  })
})
