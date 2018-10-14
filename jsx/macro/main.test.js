import React from 'react'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Main from './main'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import MacroForm from './macro_form'
import { Provider } from 'react-redux'

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
    id: 1,
    name: 'Foo',
    steps: [
      { type: 'wait', config: { duration: 10 } },
      { type: 'equipment', config: {id: '1', on: true} }
    ]
  }

  it('<Main />', () => {
    fetchMock.get('/api/macros', {})
    fetchMock.post('/api/macros/1', {})
    fetchMock.put('/api/macros', {})
    fetchMock.put('/api/macros/1', {})
    fetchMock.post('/api/macros/1/run', {})
    fetchMock.delete('/api/macros/1', {})

    const wrapper = shallow(<Main store={mockStore({ macros: [macro] })} />)
    const n = wrapper.dive()
      .instance()
    n.componentWillUnmount()
    delete n.state.timer
    n.componentWillUnmount()
    n.createMacro(macro)
    n.updateMacro(macro)
    n.deleteMacro(macro)
    n.runMacro({stopPropagation: jest.fn()}, macro)
    n.toggleAddMacroDiv()
  })

  it('<MacroForm/> for create', () => {
    const fn = jest.fn()
    const wrapper = shallow(<MacroForm onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<MacroForm /> for edit', () => {
    const fn = jest.fn()
    const wrapper = shallow(<MacroForm macro={macro} onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<MacroForm /> for edit with bad macro', () => {
    const fn = jest.fn()
    const badMacro = {name: 'bad'}
    const wrapper = shallow(<MacroForm macro={badMacro} onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<MacroForm /> for diving', () => {
    const fn = jest.fn()
    const wrapper = mount(
      <Provider store={mockStore({ macros: [macro], equipment: [{id: 1, name: 'test'}] })}>
        <MacroForm macro={macro} onSubmit={fn} />
      </Provider>
    )
    let macroSteps = wrapper.find('.macro-step')
    expect(macroSteps.length).toBe(2)
    wrapper.find('#add-step').simulate('click')
    macroSteps = wrapper.find('.macro-step')
    expect(macroSteps.length).toBe(3)
    wrapper.find('[name="remove-step-2"]').simulate('click')
    macroSteps = wrapper.find('.macro-step')
    expect(macroSteps.length).toBe(2)
  })
})
