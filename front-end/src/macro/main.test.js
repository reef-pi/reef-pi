import React from 'react'
import { act } from 'react'
import Main, { RawMacroMain } from './main'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import MacroForm, { mapMacroPropsToValues, submitMacroForm } from './macro_form'

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
    const main = new RawMacroMain({
      macros: [],
      fetch: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      run: jest.fn(),
      revert: jest.fn()
    })
    expect(() => main.render()).not.toThrow()
    expect(Main).toBeDefined()
  })

  it('<Main /> mounts with macros', () => {
    const main = new RawMacroMain({
      macros: [macro],
      fetch: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      run: jest.fn(),
      revert: jest.fn()
    })
    expect(main.render().type).toBe('ul')
  })

  it('<Main /> toggles add macro form', () => {
    const main = new RawMacroMain({
      macros: [],
      fetch: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      run: jest.fn(),
      revert: jest.fn()
    })
    main.setState = jest.fn(update => {
      main.state = { ...main.state, ...update }
    })
    main.handleToggleAddMacroDiv()
    expect(main.state.addMacro).toBe(true)
    main.handleToggleAddMacroDiv()
    expect(main.state.addMacro).toBe(false)
  })

  it('<Main /> run macro button click', () => {
    const run = jest.fn()
    const fetch = jest.fn()
    const main = new RawMacroMain({
      macros: [macro],
      fetch,
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      run,
      revert: jest.fn()
    })
    main.runMacro({ stopPropagation: jest.fn() }, macro)
    expect(run).toHaveBeenCalledWith('1')
    expect(fetch).toHaveBeenCalled()
  })

  it('<Main /> delete macro triggers confirm', async () => {
    const del = jest.fn()
    const main = new RawMacroMain({
      macros: [macro],
      fetch: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: del,
      run: jest.fn(),
      revert: jest.fn()
    })
    main.handleDeleteMacro(macro)
    await act(async () => {
      await Promise.resolve()
    })
    expect(del).toHaveBeenCalledWith('1')
  })

  it('<Main /> mounts with reversible macro', () => {
    const reversibleMacro = { ...macro, reversible: true }
    const main = new RawMacroMain({
      macros: [reversibleMacro],
      fetch: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      run: jest.fn(),
      revert: jest.fn()
    })
    expect(() => main.macroList()).not.toThrow()
  })

  it('<Main />', () => {
    const legacyMacro = { id: 1, name: 'Foo', steps: [{ type: 'wait', config: { duration: 10 } }] }
    const main = new RawMacroMain({
      macros: [legacyMacro],
      fetch: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      run: jest.fn(),
      revert: jest.fn()
    })
    expect(main.valuesToMacro({
      name: 'Foo',
      enable: false,
      reversible: false,
      steps: [{ type: 'wait', duration: 10 }]
    })).toEqual({
      name: 'Foo',
      enable: false,
      reversible: false,
      steps: [{ type: 'wait', config: { duration: 10, title: undefined, message: undefined, on: undefined, id: undefined } }]
    })
  })

  it('<MacroForm/> for create', () => {
    const fn = jest.fn()
    expect(mapMacroPropsToValues({})).toEqual({
      id: '',
      name: '',
      enable: false,
      reversible: false,
      steps: []
    })
    submitMacroForm({ id: '1' }, { onSubmit: fn })
    expect(fn).toHaveBeenCalledWith({ id: '1' })
    expect(MacroForm).toBeDefined()
  })

  it('<MacroForm /> for edit', () => {
    expect(mapMacroPropsToValues({ macro })).toEqual({
      id: '1',
      name: 'Foo',
      enable: false,
      reversible: false,
      steps: [
        { type: 'wait', duration: 10, id: undefined, on: undefined, title: undefined, message: undefined },
        { type: 'equipment', duration: undefined, id: '1', on: true, title: undefined, message: undefined }
      ]
    })
  })

  it('<MacroForm /> for edit with bad macro', () => {
    const badMacro = { name: 'bad' }
    expect(mapMacroPropsToValues({ macro: badMacro })).toEqual({
      id: '',
      name: 'bad',
      enable: false,
      reversible: false,
      steps: []
    })
  })

  it('<Main /> with reversible macro renders revert button (shallow)', () => {
    const reversibleMacro = { ...macro, reversible: true }
    const main = new RawMacroMain({
      macros: [reversibleMacro],
      fetch: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      run: jest.fn(),
      revert: jest.fn()
    })
    const revert = jest.fn()
    main.props.revert = revert
    main.props.fetch = jest.fn()
    main.revertMacro({ stopPropagation: jest.fn() }, reversibleMacro)
    expect(revert).toHaveBeenCalledWith('1')
  })
})
