import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Main from './main'
import Macro from './macro'
import New from './new'
import Step from './step'
import Steps from './steps'
import WaitStepConfig from './wait_step_config'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import GenericStepConfig from './generic_step_config'
import SelectType from './select_type'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
jest.mock('utils/confirm', () => {
  return {
    confirm: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this)
  }
})
describe('Macro UI', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })
  const macro = {
    name: 'Foo',
    steps: [{ type: 'wait', config: { duration: 10 } }]
  }
  it('<Main />', () => {
    fetchMock.get('/api/macros', {})
    fetchMock.post('/api/macros/1', {})
    fetchMock.put('/api/macros/1', {})
    fetchMock.post('/api/macros/1/run', {})
    fetchMock.delete('/api/macros/1', {})
    const n = shallow(<Main store={mockStore({ macros: [macro] })} />)
      .dive()
      .instance()
    n.componentWillUnmount()
    delete n.state.timer
    n.componentWillUnmount()
    n.props.update(1, {})
    n.props.delete(1)
    n.props.run(1)
  })

  it('<Macro />', () => {
    const i = shallow(<Macro steps={[]} update={() => true} delete={() => true} />).instance()
    i.update()
    i.setState({ expand: true })
    i.updateSteps(macro.steps)
    i.update()
    i.remove()
  })

  it('<GenericStepConfig />', () => {
    const n = shallow(
      <GenericStepConfig
        active='1'
        store={mockStore({ equipment: [{ id: '1', name: 'foo' }] })}
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
    const i = shallow(<New store={mockStore()} />)
      .dive()
      .instance()
    const ev = {
      target: { value: 'foo' }
    }
    i.add()
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
    let i = shallow(<Step config={macro.steps[0].config} type='wait' hook={() => true} />).instance()
    i.updateType('wait')
    i.updateConfig({ duration: 10 })
    i.configUI()
    i = shallow(<Step config={{ type: 'foo', config: { duration: 10 } }} type='foo' hook={() => true} />).instance()
    i.configUI()
  })

  it('<Steps />', () => {
    const i = shallow(<Steps steps={macro.steps} hook={() => {}} />).instance()
    i.updateStep(0)({ type: 'wait', config: { duration: 10 } })
    i.add()
    i.deleteStep(0)()
    let z = shallow(<Steps steps={macro.steps} readOnly hook={() => {}} />).instance()
    z.addStepUI()
  })

  it('<WaitStepConfig />', () => {
    const i = shallow(<WaitStepConfig hook={() => true} />).instance()
    const ev = {
      target: { value: 'foo' }
    }
    i.update(ev)
  })
})
