import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Main from './main'
import Macro from './macro'
import New from './new'
import Step from './step'
import Steps from './steps'
import WaitStepConfig from './wait_step_config'
import configureMockStore from 'redux-mock-store'
import {mockLocalStorage} from '../utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import GenericStepConfig from './generic_step_config'
import SelectType from './select_type'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Macro UI', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })
  const macro = {
    name: 'Foo',
    steps: [
      {type: 'wait', config: {duration: 10}}
    ]
  }
  it('<Main />', () => {
    fetchMock.get('/api/macros', {})
    const n = shallow(
      <Main store={mockStore({macros: [macro]})} />
    )
    n.dive().instance()
  })

  it('<Macro />', () => {
    const i = shallow(<Macro steps={[]} update={() => true} />).instance()
    i.update()
    i.setState({expand: true})
    i.updateSteps(macro.steps)
    i.update()
    i.remove()
  })

  it('<GenericStepConfig />', () => {
    const n = shallow(
      <GenericStepConfig
        active='1'
        store={mockStore({equipment: [{id: '1', name: 'foo'}]})}
        hook={() => true}
        type='equipment'
      />
    )
    const i = n.dive().instance()
    i.set('equipment')()
    i.updateOn(true)()
  })

  it('<New />', () => {
    fetchMock.get('/api/macros', {})
    fetchMock.putOnce('/api/macros', {})
    const i = shallow(<New store={mockStore()} />).dive().instance()
    const ev = {
      target: {value: 'foo'}
    }
    i.toggle()
    i.updateSteps(macro.steps)
    i.update('name')(ev)
    i.add()
  })

  it('<SelectType />', () => {
    const i = shallow(<SelectType type='equipment' hook={() => true} />).instance()
    i.set('macros')()
  })

  it('<Step />', () => {
    const i = shallow(
      <Step
        config={macro.steps[0].config}
        type='wait'
        hook={() => true}
      />).instance()
    i.updateType('wait')
    i.updateConfig({duration: 10})
    i.configUI()
  })

  it('<Steps />', () => {
    const i = shallow(<Steps steps={macro.steps} hook={() => {}} />).instance()
    i.updateStep(0)({type: 'wait', config: {duration: 10}})
    i.add()
    i.deleteStep(0)()
  })

  it('<WaitStepConfig />', () => {
    const i = shallow(<WaitStepConfig hook={() => true} />).instance()
    const ev = {
      target: {value: 'foo'}
    }
    i.update(ev)
  })
})
