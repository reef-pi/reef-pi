import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import JournalForm from './form'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

describe('<JournalForm />', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('renders without throwing with data', () => {
    const store = mockStore({ journal_usage: {} })
    fetchMock.getOnce('/api/journal/1/usage', {})
    const data = { id: '1', name: 'pH Log', description: 'daily', unit: 'pH' }
    const onSubmit = jest.fn()
    expect(() =>
      mount(
        <Provider store={store}>
          <JournalForm data={data} readOnly={false} onSubmit={onSubmit} />
        </Provider>
      )
    ).not.toThrow()
  })

  it('renders without throwing with no data (uses defaults)', () => {
    const store = mockStore({ journal_usage: {} })
    fetchMock.getOnce('/api/journal/undefined/usage', {})
    const onSubmit = jest.fn()
    expect(() =>
      mount(
        <Provider store={store}>
          <JournalForm readOnly={false} onSubmit={onSubmit} />
        </Provider>
      )
    ).not.toThrow()
  })
})
