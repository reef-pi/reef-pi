import React from 'react'
import { act } from 'react'
import { shallow, mount } from 'enzyme'
import Main from './main'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import MacroForm from './macro_form'
import { Provider } from 'react-redux'

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
    jest.clearAllMocks()
  })
  const macro = {
    id: '1',
    name: 'Foo',
    steps: [
      { type: 'wait', config: { duration: 10 } },
      { type: 'equipment', config: { id: '1', on: true } }
    ]
  }

  it('<Main /> mounts with empty macros', () => {
    fetchMock.get('/api/macros', [])
    const store = mockStore({ macros: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> mounts with macros', () => {
    fetchMock.get('/api/macros', [macro])
    const store = mockStore({ macros: [macro] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper.find('ul.list-group').length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('<Main /> toggles add macro form', () => {
    fetchMock.get('/api/macros', [])
    const store = mockStore({ macros: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#add_macro').simulate('click')
    wrapper.find('#add_macro').simulate('click')
    wrapper.unmount()
  })

  it('<Main /> run macro button click', () => {
    fetchMock.get('/api/macros', [])
    fetchMock.post('/api/macros/1/run', {})
    const store = mockStore({ macros: [macro] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('button[name="run-macro-1"]').simulate('click')
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> delete macro triggers confirm', () => {
    fetchMock.get('/api/macros', [])
    fetchMock.delete('/api/macros/1', {})
    const store = mockStore({ macros: [macro] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#delete-panel-macro-1').simulate('click')
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> mounts with reversible macro', () => {
    fetchMock.get('/api/macros', [])
    const reversibleMacro = { ...macro, reversible: true }
    const store = mockStore({ macros: [reversibleMacro] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper.find('button[name="reverse-macro-1"]').length).toBe(1)
    wrapper.unmount()
  })

  it('<Main />', () => {
    const legacyMacro = { id: 1, name: 'Foo', steps: [{ type: 'wait', config: { duration: 10 } }] }
    fetchMock.get('/api/macros', {})
    fetchMock.post('/api/macros/1', {})
    fetchMock.put('/api/macros', {})
    fetchMock.put('/api/macros/1', {})
    fetchMock.post('/api/macros/1/run', {})
    fetchMock.delete('/api/macros/1', {})

    const wrapper = shallow(<Main store={mockStore({ macros: [legacyMacro] })} />)
    const n = wrapper.dive()
      .instance()
  })

  it('<MacroForm/> for create', () => {
    const fn = jest.fn()
    const wrapper = shallow(<MacroForm onSubmit={fn} validateOnBlur={false} validateOnChange={false} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<MacroForm /> for edit', () => {
    const fn = jest.fn()
    const wrapper = shallow(<MacroForm macro={macro} onSubmit={fn} validateOnBlur={false} validateOnChange={false} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<MacroForm /> for edit with bad macro', () => {
    const fn = jest.fn()
    const badMacro = { name: 'bad' }
    const wrapper = shallow(<MacroForm macro={badMacro} onSubmit={fn} validateOnBlur={false} validateOnChange={false} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<Main /> with reversible macro renders revert button (shallow)', () => {
    fetchMock.get('/api/macros', {})
    const reversibleMacro = { ...macro, reversible: true }
    const wrapper = shallow(<Main store={mockStore({ macros: [reversibleMacro] })} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('<MacroForm /> for diving', () => {
    const fn = jest.fn()
    const wrapper = mount(
      <Provider store={mockStore({ macros: [macro], equipment: [{ id: 1, name: 'test' }] })}>
        <MacroForm macro={macro} onSubmit={fn} validateOnBlur={false} validateOnChange={false} />
      </Provider>
    )
    let macroSteps = wrapper.find('.macro-step')
    expect(macroSteps.length).toBe(2)
    act(() => {
      wrapper.find('#add-step').prop('onClick')()
    })
    wrapper.update()
    macroSteps = wrapper.find('.macro-step')
    expect(macroSteps.length).toBe(3)
    act(() => {
      wrapper.find('[name="remove-step-2"]').prop('onClick')()
    })
    wrapper.update()
    macroSteps = wrapper.find('.macro-step')
    expect(macroSteps.length).toBe(2)
  })
})
