import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ATO from './ato'
import Main from './main'
import Chart from './chart'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import AtoForm from './ato_form'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
jest.mock('utils/confirm', () => {
  return {
    confirm: jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        return resolve(true)
      })
    })
  }
})
describe('ATO ui', () => {
  const state = {
    ato_usage: {'1': {}},
    atos: [{name: 'foo', id: '1'}],
    readOnly: false
  }

  const eqs = [{id: '1', outlet: '1', name: 'Foo', on: true}]
  const inlets = [{id: '1', name: 'O1'}]

  it('<Main />', () => {
    shallow(
      <Main store={mockStore({inlets: inlets, equipment: eqs, atos: state.atos})} />
    ).dive().instance()
  })

  it('<ATO />', () => {
    const n = shallow(
      <ATO store={mockStore(state)} data={{id: '1', period: 10}} />
    )
    const m = n.dive().instance()
    m.expand()
    m.save({id: 2, name: 'ato', inlet: '5'})
    m.state.readOnly = false
  })

  it('<ATO /> should hanlde delete', () => {
    const wrapper = shallow(
      <ATO store={mockStore(state)} data={{id: '1', period: 10}} />
    )
    const instance = wrapper.dive().instance()
    instance.handleEdit({stopPropagation: () => {}})
    instance.handleDelete({stopPropagation: () => {}})
    instance.state.readOnly = true
    instance.render()
  })

  it('AtoForm />', () => {
    const wrapper = shallow(
      <AtoForm
        data={{enable: false, control: false}}
        values={{id: null}}
        update={() => true}
        delete={() => true}
        handleBlur={() => true}
        onSubmit={() => true}
        isValid={false}
        inlets={[{id: '1', name: 'O1'}]}
      />).instance()
    wrapper.handleSubmit()
  })

  it('<Chart />', () => {
    shallow(<Chart ato_id='1' store={mockStore(state)} />).dive().instance()
  })
})
