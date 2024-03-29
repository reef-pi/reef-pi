import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Equipment from './equipment'
import ViewEquipment from './view_equipment'
import EditEquipment from './edit_equipment'
import EquipmentForm from './equipment_form'
import Chart from './chart'
import Main from './main'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

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
describe('Equipment ui', () => {
  const eqs = [{ id: '1', outlet: '1', name: 'Foo', on: true }]
  const outlets = [{ id: '1', name: 'O1' }]

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Main />', () => {
    const m = shallow(<Main store={mockStore({ outlets: outlets, equipment: eqs })} />)
      .dive()
  })

  it('<Equipment />', () => {
    shallow(<Equipment equipment={eqs[0]} update={() => true} delete={() => true} outlets={outlets} />).instance()
  })

  it('should handle delete', () => {
    const instance = shallow(
      <Equipment equipment={eqs[0]} update={() => true} delete={() => true} outlets={outlets} />
    ).instance()
    const ev = {
      stopPropagation: () => {}
    }
    instance.handleDelete(ev)
  })

  it('should handle submit', () => {
    const instance = shallow(
      <Equipment
        equipment={eqs[0]}
        update={() => {
          return new Promise(resolve => {
            return resolve(true)
          })
        }}
        delete={() => true}
        outlets={outlets}
      />
    ).instance()
    const values = {
      id: 1,
      name: 'test',
      outlet: 3,
      on: false
    }
    instance.handleSubmit(values)
  })

  it('should handle an unrecognized outlet', () => {
    shallow(
      <Equipment equipment={eqs[0]} update={() => true} delete={() => true} outlets={[{ id: '2', name: 'O1' }]} />
    ).instance()
  })

  it('should toggle edit', () => {
    const instance = shallow(
      <Equipment equipment={eqs[0]} update={() => true} delete={() => true} outlets={[{ id: '2', name: 'O1' }]} />
    ).instance()

    const e = {
      stopPropagation: () => {}
    }
    instance.handleToggleEdit(e)
  })

  it('<ViewEquipment />', () => {
    shallow(
      <ViewEquipment equipment={eqs[0]} update={() => true} delete={() => true} outlets={[{ id: '2', name: 'O1' }]} />
    )
  })

  it('<ViewEquipment /> off', () => {
    eqs[0].on = false
    shallow(
      <ViewEquipment equipment={eqs[0]} update={() => true} delete={() => true} outlets={[{ id: '2', name: 'O1' }]} />
    )
  })

  it('<ViewEquipment /> should toggle state', () => {
    const wrapper = shallow(
      <ViewEquipment
        onStateChange={() => true}
        equipment={eqs[0]}
        update={() => true}
        delete={() => true}
        outlets={[{ id: '2', name: 'O1' }]}
      />
    )

    wrapper.find('Switch').simulate('click')
  })

  it('<EditEquipment />', () => {
    shallow(
      <EditEquipment
        actionLabel='save'
        values={{ id: 1 }}
        update={() => true}
        delete={() => true}
        outlets={[{ id: '1', name: 'O1' }]}
        handleBlur={() => true}
        submitForm={() => true}
      />
    )
  })

  it('<EditEquipment /> New Item', () => {
    shallow(
      <EditEquipment
        actionLabel='save'
        values={{ id: null }}
        update={() => true}
        delete={() => true}
        outlets={[{ id: '1', name: 'O1' }]}
        handleBlur={() => true}
        submitForm={() => true}
      />
    )
  })

  it('<EditEquipment /> should submit', () => {
    const wrapper = shallow(
      <EditEquipment
        actionLabel='save'
        values={{ id: null }}
        update={() => true}
        delete={() => true}
        handleBlur={() => true}
        submitForm={() => true}
        isValid
        outlets={[{ id: '1', name: 'O1' }]}
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditEquipment /> should show alert when invalid', () => {
    const wrapper = shallow(
      <EditEquipment
        actionLabel='save'
        values={{ id: null }}
        update={() => true}
        delete={() => true}
        handleBlur={() => true}
        submitForm={() => true}
        isValid={false}
        outlets={[{ id: '1', name: 'O1' }]}
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EquipmentForm />', () => {
    const wrapper = shallow(
      <EquipmentForm
        actionLabel='save'
        values={{ id: null }}
        update={() => true}
        delete={() => true}
        handleBlur={() => true}
        onSubmit={() => true}
        isValid={false}
        outlets={[{ id: '1', name: 'O1' }]}
      />
    ).instance()
    wrapper.handleSubmit()
  })

  it('<Chart />', () => {
    const m = shallow(<Chart store={mockStore({ equipment: eqs })} />)
      .dive()
      .instance()
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore()} />).dive()
  })
})
