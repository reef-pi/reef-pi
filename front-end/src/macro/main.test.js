import React from 'react'
import { act } from 'react'
import Main, { RawMacroMain } from './main'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import MacroForm, { mapMacroPropsToValues, submitMacroForm } from './macro_form'
import Collapsible from '../ui_components/collapsible'

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
    jest.restoreAllMocks()
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

  const makeMain = (props = {}) => {
    return new RawMacroMain({
      macros: [],
      fetch: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      run: jest.fn(),
      revert: jest.fn(),
      ...props
    })
  }

  const applySetState = (instance) => {
    instance.setState = jest.fn(update => {
      const next = typeof update === 'function' ? update(instance.state, instance.props) : update
      instance.state = { ...instance.state, ...next }
    })
  }

  const findAll = (node, predicate, matches = []) => {
    if (!node || typeof node !== 'object') {
      return matches
    }
    if (predicate(node)) {
      matches.push(node)
    }
    React.Children.toArray(node.props?.children).forEach(child => {
      findAll(child, predicate, matches)
    })
    return matches
  }

  it('<Main /> mounts with empty macros', () => {
    const main = makeMain()
    expect(() => main.render()).not.toThrow()
    expect(Main).toBeDefined()
  })

  it('<Main /> mounts with macros', () => {
    const macros = [
      { ...macro, id: '1', name: 'Macro B' },
      { ...macro, id: '2', name: 'Macro A' }
    ]
    const main = makeMain({ macros })
    expect(main.render().type).toBe('ul')
    expect(macros.map(item => item.name)).toEqual(['Macro B', 'Macro A'])
  })

  it('<Main /> toggles add macro form', () => {
    const main = makeMain()
    applySetState(main)
    main.handleToggleAddMacroDiv()
    expect(main.state.addMacro).toBe(true)
    main.handleToggleAddMacroDiv()
    expect(main.state.addMacro).toBe(false)
  })

  it('<Main /> run macro button click', () => {
    const run = jest.fn()
    const fetch = jest.fn()
    const main = makeMain({ macros: [macro], fetch, run })
    main.runMacro({ stopPropagation: jest.fn() }, macro)
    expect(run).toHaveBeenCalledWith('1')
    expect(fetch).toHaveBeenCalled()
  })

  it('<Main /> delete macro triggers confirm', async () => {
    const del = jest.fn()
    const main = makeMain({ macros: [macro], delete: del })
    main.handleDeleteMacro(macro)
    await act(async () => {
      await Promise.resolve()
    })
    expect(del).toHaveBeenCalledWith('1')
  })

  it('<Main /> mounts with reversible macro', () => {
    const reversibleMacro = { ...macro, reversible: true }
    const main = makeMain({ macros: [reversibleMacro] })
    expect(() => main.macroList()).not.toThrow()
  })

  it('<Main />', () => {
    const legacyMacro = { id: 1, name: 'Foo', steps: [{ type: 'wait', config: { duration: 10 } }] }
    const main = makeMain({ macros: [legacyMacro] })
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

  it('<MacroForm /> maps alert and wait step config into flat form values', () => {
    expect(mapMacroPropsToValues({
      macro: {
        id: '2',
        name: 'Notify',
        enable: true,
        reversible: true,
        steps: [
          { type: 'alert', config: { title: 'ATO', message: 'Low reservoir' } },
          { type: 'wait', config: { duration: 30 } }
        ]
      }
    })).toEqual({
      id: '2',
      name: 'Notify',
      enable: true,
      reversible: true,
      steps: [
        { type: 'alert', duration: undefined, id: undefined, on: undefined, title: 'ATO', message: 'Low reservoir' },
        { type: 'wait', duration: 30, id: undefined, on: undefined, title: undefined, message: undefined }
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
    const main = makeMain({ macros: [reversibleMacro] })
    const revert = jest.fn()
    main.props.revert = revert
    main.props.fetch = jest.fn()
    main.revertMacro({ stopPropagation: jest.fn() }, reversibleMacro)
    expect(revert).toHaveBeenCalledWith('1')
  })

  it('<Main /> fetches macros and stores polling timer on mount', () => {
    const fetch = jest.fn()
    const main = makeMain({ fetch })
    applySetState(main)
    const setInterval = jest.spyOn(window, 'setInterval').mockReturnValue(123)

    main.componentDidMount()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(setInterval).toHaveBeenCalledWith(fetch, 10 * 1000)
    expect(main.state.timer).toBe(123)
  })

  it('<Main /> clears polling timer on unmount', () => {
    const main = makeMain()
    main.state.timer = 456
    const clearInterval = jest.spyOn(window, 'clearInterval').mockImplementation(() => {})

    main.componentWillUnmount()

    expect(clearInterval).toHaveBeenCalledWith(456)
  })

  it('<Main /> creates macro with normalized payload and closes add form', () => {
    const create = jest.fn()
    const main = makeMain({ create })
    applySetState(main)
    main.state.addMacro = true

    main.handleCreateMacro({
      name: 'Feed',
      enable: false,
      reversible: true,
      steps: [
        { type: 'wait', duration: 5 },
        { type: 'alert', title: 'Done', message: 'Feeding complete' }
      ]
    })

    expect(create).toHaveBeenCalledWith({
      name: 'Feed',
      enable: false,
      reversible: true,
      steps: [
        { type: 'wait', config: { duration: 5, title: undefined, message: undefined, on: undefined, id: undefined } },
        { type: 'alert', config: { duration: undefined, title: 'Done', message: 'Feeding complete', on: undefined, id: undefined } }
      ]
    })
    expect(main.state.addMacro).toBe(false)
  })

  it('<Main /> renders run and revert labels with disabled states', () => {
    const main = makeMain({
      macros: [
        { ...macro, id: 'idle', name: 'Idle', reversible: true, enable: false },
        { ...macro, id: 'active', name: 'Active', reversible: true, enable: true }
      ]
    })

    const panels = main.macroList()
    const activeButtons = panels[0].props.buttons
    const idleButtons = panels[1].props.buttons

    expect(activeButtons.map(button => button.props.name)).toEqual(['run-macro-active', 'reverse-macro-active'])
    expect(activeButtons.map(button => button.props.disabled)).toEqual([true, true])
    expect(activeButtons[0].props.children).toMatch(/running/i)
    expect(activeButtons[1].props.children).toMatch(/reverting/i)

    expect(idleButtons.map(button => button.props.name)).toEqual(['run-macro-idle', 'reverse-macro-idle'])
    expect(idleButtons.map(button => button.props.disabled)).toEqual([false, false])
    expect(idleButtons[0].props.children).toMatch(/run/i)
    expect(idleButtons[1].props.children).toMatch(/revert/i)
  })

  it('<Main /> renders macro panels sorted by name without mutating props', () => {
    const macros = [
      { ...macro, id: '20', name: 'Macro 20' },
      { ...macro, id: '3', name: 'Macro 3' },
      { ...macro, id: '1', name: 'Macro 1' }
    ]
    const main = makeMain({ macros })
    const rendered = main.render()
    const panels = findAll(rendered, node => node.type === Collapsible)

    expect(panels.map(panel => panel.props.name)).toEqual(['panel-macro-1', 'panel-macro-3', 'panel-macro-20'])
    expect(panels.map(panel => panel.props.item.name)).toEqual(['Macro 1', 'Macro 3', 'Macro 20'])
    expect(macros.map(item => item.name)).toEqual(['Macro 20', 'Macro 3', 'Macro 1'])
  })
})
