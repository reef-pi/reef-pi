import React from 'react'
import ComponentSelector from './component_selector'
import Config from './config'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Grid from './grid'
import Main from './main'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Dashboard', () => {
  it('<Main />', () => {
    const config = {
      row: 4,
      column: 2,
      width: 400,
      height: 200,
      grid_details: [
        [{ type: 'equipment' }, { type: 'ato', id: '1' }],
        [{ type: 'light', id: '1' }, { type: 'health', id: 'current' }],
        [{ type: 'ph-current', id: '1' }, { type: 'ph-historical', id: 'current' }],
        [{ type: 'tc', id: '1' }, { type: 'temperature', id: 'current' }]
      ]
    }
    const m = shallow(<Main store={mockStore({ dashboard: config })} />)
      .dive()
      .instance()
    m.toggle()
  })

  it('<Grid />', () => {
    const cells = [[{ type: 'ato', id: '1' }, { type: 'light', id: '2' }], [{ type: 'tc', id: '1' }]]
    const m = shallow(<Grid rows={2} columns={2} cells={cells} hook={() => {}} />).instance()
    m.setType(0, 0)('equipment')
    m.updateHook(0, 0)('1')
  })

  it('<ComponentSelector />', () => {
    const comps = {
      c1: { id: '1', name: 'foo' },
      c2: undefined
    }
    shallow(<ComponentSelector hook={() => {}} components={comps} current_id="1" />)
  })

  it('<Config />', () => {
    const cells = [[{ type: 'ato', id: '1' }]]
    const config = { row: 1, column: 1, grid_details: cells }
    const m = shallow(<Config store={mockStore({ dashboard: config })} />)
      .dive()
      .instance()
    m.updateHook(cells)
    m.save()
  })
})
