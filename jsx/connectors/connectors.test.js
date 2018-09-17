import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Main from './main'
import Inlets from './inlets'
import Inlet from './inlet'
import Outlet from './outlet'
import InletSelector from './inlet_selector'
import Jacks from './jacks'
import Jack from './jack'
import Outlets from './outlets'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Connectors', () => {
  it('<Main />', () => {
    shallow(<Main />)
  })

  it('<InletSelector />', () => {
    const state = {
      inlets: [{id: '1', name: 'foo', pin: 1}]
    }
    const m = shallow(<InletSelector store={mockStore(state)} active='1' update={() => true} />).dive().instance()
    m.set(0)
  })

  it('<Inlets />', () => {
    const state = {
      inlets: [{id: '1', name: 'foo', pin: 1, reverse: true}]
    }
    const m = shallow(<Inlets store={mockStore(state)} />).dive().instance()
    m.add()
    m.remove('1')()
  })

  it('<Inlet />', () => {
    const m = shallow(
      <Inlet
        inlet_id='1'
        name='foo'
        pin={1}
        reverse={false}
        update={() => true}
        remove={() => true}
      />).instance()
    m.edit()
  })

  it('<Jacks />', () => {
    const state = {
      jacks: [{id: '1', name: 'J2', pins: [0, 2]}]
    }
    const m = shallow(<Jacks store={mockStore(state)} />).dive().instance()
    m.add()
    m.setDriver('rpi')()
    m.remove('1')()
  })

  it('<Jack />', () => {
    const m = shallow(
      <Jack
        jack_id='1'
        name='foo'
        pins={[1, 2]}
        update={() => true}
        remove={() => true}
        driver='rpi'
      />).instance()
    m.edit()
    m.setDriver('pca9685')()
  })

  it('<Outlets />', () => {
    const state = {
      outlets: [{id: '1', name: 'J2', pin: 2, reverse: true}]
    }
    const m = shallow(<Outlets store={mockStore(state)} />).dive().instance()
    m.add()
    m.remove('1')()
  })

  it('<Outlet />', () => {
    const m = shallow(
      <Outlet
        name='foo'
        reverse
        pin={1}
        outlet_id='1'
        update={() => true}
        remove={() => true}
      />).instance()
    m.edit()
  })
})
