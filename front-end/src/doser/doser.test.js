import React from 'react'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Main from './main'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'
import DoserForm from './doser_form'
import { Provider } from 'react-redux'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
let fn = jest.fn()
jest.mock('utils/confirm', () => {
  return {
    showModal: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this),
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

describe('Doser ui', () => {
  it('<Main />', () => {
    const mock = {
      dosers: [{ foo: 'bar', regiment: {} }]
    }
    const m = mount(
      <Provider store={mockStore(mock)}>
        <Main />
      </Provider>  
      )

  })

  it('<DoserForm/> for create', () => {
    const fn = jest.fn()
    const wrapper = shallow(<DoserForm onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<DoserForm /> for edit', () => {
    const fn = jest.fn()

    const doser = {
      name: 'name',
      regiment: {
        enable: true,
        schedule: {
          day: '*',
          hour: '17',
          minute: '0',
          second: '0'
        }
      }
    }
    const wrapper = shallow(<DoserForm doser={doser} onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })
})
