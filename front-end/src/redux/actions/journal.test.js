import {
  journalUpdated,
  journalsLoaded,
  journalLoaded,
  journalUsageLoaded,
  journalRecorded,
  fetchJournals,
  fetchJournal,
  fetchJournalUsage,
  createJournal,
  updateJournal,
  deleteJournal,
  recordJournal
} from './journal'
import { thunk } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('journal actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('journalUpdated returns correct type', () => {
    expect(journalUpdated().type).toBe('JOURNAL_UPDATED')
  })

  it('journalsLoaded returns correct type and payload', () => {
    const action = journalsLoaded([])
    expect(action.type).toBe('JOURNALS_LOADED')
    expect(action.payload).toEqual([])
  })

  it('journalLoaded returns correct type and payload', () => {
    const action = journalLoaded({ id: '1' })
    expect(action.type).toBe('JOURNAL_LOADED')
    expect(action.payload).toEqual({ id: '1' })
  })

  it('journalUsageLoaded returns a function that returns correct action', () => {
    const fn = journalUsageLoaded('1')
    const action = fn({ data: [] })
    expect(action.type).toBe('JOURNAL_USAGE_LOADED')
    expect(action.payload).toEqual({ data: { data: [] }, id: '1' })
  })

  it('journalRecorded returns a function that returns correct action', () => {
    const fn = journalRecorded('1')
    const action = fn({ entries: [] })
    expect(action.type).toBe('JOURNAL_RECORDED')
    expect(action.payload).toEqual({ data: { entries: [] }, id: '1' })
  })

  it('fetchJournals dispatches journalsLoaded', () => {
    fetchMock.getOnce('/api/journal', [])
    const store = mockStore()
    return store.dispatch(fetchJournals()).then(() => {
      expect(store.getActions()).toEqual([journalsLoaded([])])
    })
  })

  it('fetchJournal dispatches journalLoaded', () => {
    fetchMock.getOnce('/api/journal/1', { id: '1' })
    const store = mockStore()
    return store.dispatch(fetchJournal('1')).then(() => {
      expect(store.getActions()).toEqual([journalLoaded({ id: '1' })])
    })
  })

  it('fetchJournalUsage dispatches journalUsageLoaded', () => {
    fetchMock.getOnce('/api/journal/1/usage', { data: [] })
    const store = mockStore()
    return store.dispatch(fetchJournalUsage('1')).then(() => {
      expect(store.getActions()[0].type).toBe('JOURNAL_USAGE_LOADED')
      expect(store.getActions()[0].payload.id).toBe('1')
    })
  })

  it('createJournal calls PUT then re-fetches', () => {
    fetchMock.putOnce('/api/journal', {})
    fetchMock.getOnce('/api/journal', [])
    const store = mockStore()
    return store.dispatch(createJournal({ name: 'test' })).then(() => {
      expect(store.getActions()).toEqual([journalsLoaded([])])
    })
  })

  it('updateJournal calls POST then re-fetches', () => {
    fetchMock.postOnce('/api/journal/1', {})
    fetchMock.getOnce('/api/journal', [])
    const store = mockStore()
    return store.dispatch(updateJournal('1', {})).then(() => {
      expect(store.getActions()).toEqual([journalsLoaded([])])
    })
  })

  it('deleteJournal calls DELETE then re-fetches', () => {
    fetchMock.deleteOnce('/api/journal/1', {})
    fetchMock.getOnce('/api/journal', [])
    const store = mockStore()
    return store.dispatch(deleteJournal('1')).then(() => {
      expect(store.getActions()).toEqual([journalsLoaded([])])
    })
  })

  it('recordJournal calls POST to record endpoint', () => {
    fetchMock.postOnce('/api/journal/1/record', { entries: [] })
    const store = mockStore()
    return store.dispatch(recordJournal('1', { value: 7.2 })).then(() => {
      expect(store.getActions()[0].type).toBe('JOURNAL_RECORDED')
      expect(store.getActions()[0].payload.id).toBe('1')
    })
  })
})
