import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Admin from './admin'
import Capabilities from './capabilities'
import ComponentSelector from './component_selector'
import Dashboard from './dashboard'
import Display from './display'
import Grid from './grid'
import HealthNotify from './health_notify'
import Main from './main'
import Settings from './settings'
import {mockLocalStorage} from '../utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import renderer from 'react-test-renderer'
import {Provider} from 'react-redux'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Configuration ui', () => {
  it('<Main />', () => {
    renderer.create(
      <Provider store={mockStore({capabilities: []})} >
        <Main />
      </Provider>
    )
  })

  it('<Admin />', () => {
    renderer.create(
      <Provider store={mockStore()} >
        <Admin />
      </Provider>
    )
  })

  it('<Display />', () => {
    renderer.create(
      <Provider store={mockStore({capabilities: []})} >
        <Display />
      </Provider>
    )
  })

  it('<Capabilities />', () => {
    shallow(<Capabilities capabilities={[]} />)
  })

  it('<ComponentSelector />', () => {
    shallow(<ComponentSelector hook={() => {}} components={[{id: '1'}]} />).instance()
  })

  it('<Dashboard />', () => {
    const cells = [
      [{type: 'ato', id: '1'}]
    ]
    const config = {row: 1, column: 1, grid_details: cells}
    const m = shallow(<Dashboard store={mockStore({dashboard: config})} />).dive().instance()
    m.updateHook(cells)
    m.save()
  })

  it('<Grid />', () => {
    const cells = [
      [{type: 'ato', id: '1'}]
    ]
    const m = shallow(<Grid rows={1} columns={1} cells={cells} hook={() => {}} />).instance()
    m.setType(0, 0)('equipment')
    m.updateHook(0, 0)('1')
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
    const m = shallow(
      <Settings store={mockStore({settings: settings, capabilities: capabilities})} />
    ).dive().instance()
    m.updateCapabilities(capabilities)
    m.updateHealthNotify({})
  })

  it('<HealthNotify />', () => {
    const m = shallow(<HealthNotify state={{}} update={() => true} />).instance()
    m.updateEnable({target: {}})
    m.update('foo')({target: {}})
  })
})
