import LogCenter from './main'
import { setAPILog, setUILog } from './log'
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { advanceTo, clear } from 'jest-date-mock'
const mockStore = configureMockStore([thunk])
Enzyme.configure({ adapter: new Adapter() })

describe('logCenter', () => {
  afterEach(() => {
    clear()
  })
  it('logCenter statics', () => {
    advanceTo(new Date(1538562752))
    const expectUI = {
      ts: 1538562752,
      emitter: 'UI',
      content: 'foo',
      type: 'SUCCESS'
    }
    const expectUIFalse = {
      ts: 1538562752,
      emitter: 'UI',
      content: 'foo',
      type: 'SUCCESS'
    }
    const expectAPI = {
      ts: 1538562752,
      emitter: 'API',
      content: 'foo',
      type: 'WARNING'
    }
    const r = setAPILog('WARNING', 'foo')
    const r2 = setUILog('SUCCESS', 'foo')
    const r3 = setUILog('SUCCESS', 'foo', false)
    expect(r).toEqual(expectAPI)
    expect(r2).toEqual(expectUI)
    expect(r3).toEqual(expectUIFalse)
  })
  it('<logCenter />', () => {
    const logs = [
      {
        ts: 1538562759,
        emitter: 'UI',
        content: 'foo',
        type: 'ERROR'
      },
      {
        ts: 1538562751,
        emitter: 'UI',
        content: 'foo',
        type: 'INFO'
      },
      {
        ts: 1538562752,
        emitter: 'UI',
        content: 'foo',
        type: 'SUCCESS'
      },
      {
        ts: 1538562753,
        emitter: 'UI',
        content: 'foo',
        type: 'WARNING'
      }
    ]
    const store = mockStore({ logs: logs })
    const wrapper = shallow(<LogCenter store={store} />).dive()
    expect(wrapper.find('.log-entry').length).toBe(4)
  })
})
