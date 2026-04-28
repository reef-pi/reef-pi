import {
  macroUpdated,
  macroRun,
  macroRevert,
  macrosLoaded,
  macroUsageLoaded,
  fetchMacros,
  fetchMacroUsage,
  createMacro,
  updateMacro,
  deleteMacro,
  runMacro,
  revertMacro
} from './macro'
import { thunk } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('macro actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('macroUpdated returns correct type', () => {
    expect(macroUpdated().type).toBe('MACRO_UPDATED')
  })

  it('macroRun returns correct type', () => {
    expect(macroRun().type).toBe('MACRO_RUN')
  })

  it('macroRevert returns correct type', () => {
    expect(macroRevert().type).toBe('MACRO_REVERT')
  })

  it('macrosLoaded returns correct type and payload', () => {
    const action = macrosLoaded([])
    expect(action.type).toBe('MACROS_LOADED')
    expect(action.payload).toEqual([])
  })

  it('macroUsageLoaded returns a function that returns correct action', () => {
    const fn = macroUsageLoaded('1')
    const action = fn({ steps: [] })
    expect(action.type).toBe('MACRO_USAGE_LOADED')
    expect(action.payload.id).toBe('1')
  })

  it('fetchMacros dispatches macrosLoaded', () => {
    fetchMock.getOnce('/api/macros', [])
    const store = mockStore()
    return store.dispatch(fetchMacros()).then(() => {
      expect(store.getActions()).toEqual([macrosLoaded([])])
    })
  })

  it('fetchMacroUsage dispatches macroUsageLoaded', () => {
    fetchMock.getOnce('/api/macros/1/usage', { steps: [] })
    const store = mockStore()
    return store.dispatch(fetchMacroUsage('1')).then(() => {
      expect(store.getActions()[0].type).toBe('MACRO_USAGE_LOADED')
      expect(store.getActions()[0].payload.id).toBe('1')
    })
  })

  it('createMacro calls PUT then re-fetches', () => {
    fetchMock.putOnce('/api/macros', {})
    fetchMock.getOnce('/api/macros', [])
    const store = mockStore()
    return store.dispatch(createMacro({ name: 'test' })).then(() => {
      expect(store.getActions()).toEqual([macrosLoaded([])])
    })
  })

  it('updateMacro calls POST then re-fetches', () => {
    fetchMock.postOnce('/api/macros/1', {})
    fetchMock.getOnce('/api/macros', [])
    const store = mockStore()
    return store.dispatch(updateMacro('1', {})).then(() => {
      expect(store.getActions()).toEqual([macrosLoaded([])])
    })
  })

  it('deleteMacro calls DELETE then re-fetches', () => {
    fetchMock.deleteOnce('/api/macros/1', {})
    fetchMock.getOnce('/api/macros', [])
    const store = mockStore()
    return store.dispatch(deleteMacro('1')).then(() => {
      expect(store.getActions()).toEqual([macrosLoaded([])])
    })
  })

  it('runMacro calls POST to run endpoint', () => {
    fetchMock.postOnce('/api/macros/1/run', {})
    const store = mockStore()
    return store.dispatch(runMacro('1')).then(() => {
      expect(store.getActions()).toEqual([macroRun()])
    })
  })

  it('revertMacro calls POST to revert endpoint', () => {
    fetchMock.postOnce('/api/macros/1/revert', {})
    const store = mockStore()
    return store.dispatch(revertMacro('1')).then(() => {
      expect(store.getActions()).toEqual([macroRevert()])
    })
  })
})
