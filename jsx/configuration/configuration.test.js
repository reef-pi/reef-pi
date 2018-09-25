import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Admin from './admin'
import Capabilities from './capabilities'
import Display from './display'
import Errors from './errors'
import HealthNotify from './health_notify'
import Main from './main'
import Settings from './settings'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
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
    m.reload()
    m.powerOff()
    m.reboot()
    m.signout()
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
    m.toggle()
    m.setBrightness({ target: { value: 10 } })
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
    m.update()
    m.updateHealthNotify({})
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
  })

  it('<HealthNotify />', () => {
    const m = shallow(<HealthNotify state={{}} update={() => true} />).instance()
    m.updateEnable({ target: {} })
    m.update('foo')({ target: {} })
    m.setState({
      notify: {
        enable: true
      }
    })
  })

  it('<Errors />', () => {
    let m = shallow(
      <Errors
        store={mockStore({
          errors: [{ id: '1', time: 'dd', message: 'dd' }]
        })}
      />
    )
      .dive()
      .instance()
    m.props.delete('1')
    m.props.clear()
    m.props.fetch()
  })
})
