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
    let m = shallow(<Main store={mockStore({ dashboard: config })} />)
      .dive()
      .instance()
    m.handleToggle()
    m = shallow(<Main store={mockStore({})} />)
      .dive()
      .instance()
    m.charts()
  })

  it('<Grid />', () => {
    var cells = [
      [{ id: '1', type: 'light' }, { id: '2', type: 'light' }],
      [{ id: '1', type:'equipment' }, { id: '2',type: 'ato' }],
    ]
    const m = shallow(<Grid rows={2} columns={2} cells={cells} hook={() => {}} />).instance()
    m.setType(0, 0, 'equipment')()
    m.updateHook(0, 0)('1')
    m.menuItem('ato', true, 0, 1)
    delete m.state.cells
    m.render()
    delete m.state.cells
    m.initiatlizeCell(1, 2)
  })

  it('<ComponentSelector />', () => {
    const comps = {
      c1: { id: '1', name: 'foo' },
      c2: undefined
    }
    const m = shallow(<ComponentSelector hook={() => {}} components={comps} current_id='1' />).instance()
    m.setID(1, 'foo')({})
  })

  it('<Config />', () => {
    const cells = [[{ type: 'ato', id: '1' }]]
    const config = { row: 1, column: 1, grid_details: cells }
    const m = shallow(<Config store={mockStore({ dashboard: config })} />)
      .dive()
      .instance()
    m.updateHook(cells)
    m.handleSave()
  })
})
