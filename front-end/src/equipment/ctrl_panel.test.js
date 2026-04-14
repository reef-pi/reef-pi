import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import EquipmentCtrlPanel from './ctrl_panel'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

const equipment = [
  { id: '1', name: 'Heater', on: true, outlet: '1', stay_off_on_boot: false },
  { id: '2', name: 'Pump', on: false, outlet: '2', stay_off_on_boot: true }
]
const outlets = [
  { id: '1', name: 'O1' },
  { id: '2', name: 'O2' }
]

describe('<EquipmentCtrlPanel />', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('renders without throwing with equipment', () => {
    const store = mockStore({ equipment, outlets })
    expect(() =>
      shallow(<Provider store={store}><EquipmentCtrlPanel /></Provider>)
    ).not.toThrow()
  })

  it('renders without throwing with undefined equipment', () => {
    const store = mockStore({ equipment: undefined, outlets: [] })
    expect(() =>
      shallow(<Provider store={store}><EquipmentCtrlPanel /></Provider>)
    ).not.toThrow()
  })

  it('renders connected component via dive', () => {
    const store = mockStore({ equipment, outlets })
    fetchMock.getOnce('/api/equipment', equipment)
    const wrapper = shallow(<EquipmentCtrlPanel store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders via dive', () => {
    const store = mockStore({ equipment, outlets })
    fetchMock.getOnce('/api/equipment', equipment)
    const wrapper = shallow(<EquipmentCtrlPanel store={store} />).dive()
    expect(wrapper).toBeDefined()
  })
})
