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

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore()

describe('Configuration ui', () => {
  it('<Main />', () => {
    shallow(<Main />)
  })

  it('<Admin />', () => {
    shallow(<Admin store={mockStore()} />)
  })

  it('<Display />', () => {
    shallow(<Display store={mockStore()} />)
  })

  it('<Capabilities />', () => {
    shallow(<Capabilities capabilities={[]} />)
  })

  it('<ComponentSelector />', () => {
    shallow(<ComponentSelector />)
  })

  it('<Dashboard />', () => {
    shallow(<Dashboard store={mockStore()} />)
  })

  it('<Grid />', () => {
    shallow(<Grid />)
  })

  it('<Settings />', () => {
    shallow(<Settings store={mockStore()} />)
  })

  it('<HealthNotify />', () => {
    shallow(<HealthNotify state={{}} />)
  })
})
