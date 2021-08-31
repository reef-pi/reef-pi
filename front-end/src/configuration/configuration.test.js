import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Admin from './admin'
import Capabilities from './capabilities'
import Display from './display'
import Errors from './errors'
import About from './about'
import HealthNotify from './health_notify'
import Main from './main'
import Settings from './settings'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import SignIn from 'sign_in'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Configuration ui', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('<Main />', () => {
    const m = shallow(<Main store={mockStore()} />).instance()
    m.setBody(1)()
  })

  it('<Admin />', () => {
    const m = shallow(<Admin store={mockStore()} />)
      .dive()
      .instance()
    fetchMock.postOnce('/api/admin/reload', {})
    fetchMock.postOnce('/api/admin/reboot', {})
    fetchMock.postOnce('/api/admin/poweroff', {})
    SignIn.logout = jest.fn().mockImplementation(() => {
      return true
    })
    m.handleReload()
    m.handlePowerOff()
    m.handleReboot()
    m.handleSignout()
    m.props.reload()
    m.props.reboot()
    m.props.powerOff()
  })

  it('<Display />', () => {
    const state = {
      display: {
        brightness: 50,
        on: true
      }
    }
    const m = shallow(<Display store={mockStore(state)} />)
      .dive()
      .instance()
    m.handleToggle()
    m.handleSetBrightness({ target: { value: 10 } })
    shallow(<Display store={mockStore({})} />)
      .dive()
      .instance()
    shallow(<Display store={mockStore({ display: {} })} />)
      .dive()
      .instance()
  })

  it('<Capabilities />', () => {
    const caps = {
      equipment: true,
      timer: false,
      dashboard: true
    }
    const m = shallow(<Capabilities capabilities={caps} update={() => true} />).instance()
    m.updateCapability('dashboard')({ target: { checked: true } })
  })

  it('<Settings />', () => {
    const capabilities = {
      health_check: true
    }
    const settings = {
      name: 'foo',
      interface: 'en0',
      address: 'localhost:8080'
    }
    let m = shallow(<Settings store={mockStore({ settings: settings, capabilities: capabilities })} />)
      .dive()
      .instance()
    m.updateCapabilities(capabilities)
    m.updateCheckbox('foo')({ target: { checked: true } })
    m.handleUpdate()
    m.updateHealthNotify({})
    m.updateHealthNotify()
    m.updateCapabilities({
      health_check: false
    })

    m = shallow(
      <Settings
        store={mockStore({
          settings: {
            name: 'foo',
            interface: 'en0',
            address: 'localhost:8080',
            display: true
          },
          capabilities: {
            health_check: true
          }
        })}
      />
    )
      .dive()
      .instance()
    shallow(<Settings store={mockStore({})} />).dive()
    shallow(<Settings store={mockStore({ settings: {} })} />).dive()

    const d = shallow(<Settings store={mockStore({ settings: settings, capabilities: capabilities })} />).dive()

    d.find('#to-row-interface')
      .first()
      .simulate('change', { target: { value: 'foo' } })
  })

  it('<Settings /> should remove port 80 if choosing https', () => {
    const capabilities = {
      health_check: true
    }
    const settings = {
      name: 'reef-pi',
      interface: 'wlan0',
      address: 'localhost:80',
      https: false
    }
    const wrapper = shallow(<Settings store={mockStore({ settings: settings, capabilities: capabilities })} />).dive()

    wrapper.find('#to-row-address').simulate('change', { target: { value: 'localhost:80' } })

    wrapper.find('.dropdown-item[children="https://"]').simulate('click')
    expect(wrapper.find('#to-row-address').props().value).toBe('localhost')
  })

  it('<Settings /> should remove port 443 if choosing http', () => {
    const capabilities = {
      health_check: true
    }
    const settings = {
      name: 'reef-pi',
      interface: 'wlan0',
      address: 'localhost:443',
      https: true
    }
    const wrapper = shallow(<Settings store={mockStore({ settings: settings, capabilities: capabilities })} />).dive()

    wrapper.find('.dropdown-item[children="http://"]').simulate('click')
    expect(wrapper.find('#to-row-address').props().value).toBe('localhost')
  })

  it('<Settings /> should not change the port when changing protocol if not 80 or 443', () => {
    const capabilities = {
      health_check: true
    }
    const settings = {
      name: 'reef-pi',
      interface: 'wlan0',
      address: 'localhost',
      https: true
    }
    const wrapper = shallow(<Settings store={mockStore({ settings: settings, capabilities: capabilities })} />).dive()

    wrapper.find('#to-row-address').simulate('change', { target: { value: 'localhost:1234' } })

    wrapper.find('.dropdown-item[children="http://"]').simulate('click')
    expect(wrapper.find('#to-row-address').props().value).toBe('localhost:1234')
  })

  it('<HealthNotify />', () => {
    const m = shallow(<HealthNotify state={{}} update={() => true} />).instance()
    m.handleUpdateEnable({ target: {} })
    m.update('foo')({ target: {} })
    m.setState({
      notify: {
        enable: true
      }
    })
  })

  it('<About />', () => {
    const m = shallow(
      <About
        store={mockStore({
          info: { current_time: new Date(), version: 'test', uptime: '5 minutes', ip: 'localhost' },
          errors: []
        })}
      />
    )
      .dive()
      .instance()
    m.props.fetchInfo()
    m.componentWillUnmount()
    delete m.state.timer
    m.componentWillUnmount()
  })
  it('<Errors />', () => {
    const wrapper = shallow(
      <Errors
        store={mockStore({
          errors: [{ id: '1', time: 'dd', message: 'dd' }]
        })}
      />
    ).dive()
    wrapper.find('.btn-outline-secondary').first().simulate('click')
    const m = wrapper.instance()
    m.props.delete('1')
    m.props.clear()
    m.props.fetch()
    wrapper.find('input').simulate('click')
  })
})
