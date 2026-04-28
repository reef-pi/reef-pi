import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import Journal from './journal'
import { useDispatch } from 'react-redux'
import { fetchJournal, fetchJournalUsage, recordJournal, updateJournal } from 'redux/actions/journal'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

jest.mock('i18next', () => ({
  t: key => key
}))

jest.mock('react-redux', () => ({
  useDispatch: jest.fn()
}))

jest.mock('redux/actions/journal', () => ({
  fetchJournal: jest.fn(id => ({ type: 'FETCH_JOURNAL', id })),
  fetchJournalUsage: jest.fn(id => ({ type: 'FETCH_JOURNAL_USAGE', id })),
  recordJournal: jest.fn((id, payload) => ({ type: 'RECORD_JOURNAL', id, payload })),
  updateJournal: jest.fn((id, payload) => ({ type: 'UPDATE_JOURNAL', id, payload }))
}))

jest.mock('./form', () => {
  const React = require('react')
  return function MockJournalForm (props) {
    return React.createElement(
      'button',
      {
        type: 'button',
        'data-testid': 'journal-form-submit',
        onClick: () => props.onSubmit({
          id: props.data.id,
          name: 'Updated Journal',
          description: 'updated description',
          unit: 'dKH'
        })
      },
      'journal-form'
    )
  }
})

jest.mock('./entry_form', () => {
  const React = require('react')
  return function MockEntryForm (props) {
    return React.createElement(
      'button',
      {
        type: 'button',
        'data-testid': 'entry-form-submit',
        onClick: () => props.onSubmit({ value: '8.2', comment: 'daily check' })
      },
      'entry-form'
    )
  }
})

jest.mock('./chart', () => {
  const React = require('react')
  return function MockChart (props) {
    return React.createElement('div', { 'data-testid': 'journal-chart', 'data-journal-id': props.journal_id })
  }
})

const config = { id: '1', name: 'pH Log', description: 'daily', unit: 'pH' }

describe('<Journal />', () => {
  const dispatch = jest.fn()

  beforeEach(() => {
    dispatch.mockClear()
    jest.clearAllMocks()
    useDispatch.mockReturnValue(dispatch)
  })

  const renderJournal = (extraProps = {}) => {
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<Journal config={config} readOnly={false} expanded={false} {...extraProps} />)
    })

    return {
      container,
      unmount: () => act(() => root.unmount())
    }
  }

  it('renders the chart and add entry button', () => {
    const { container, unmount } = renderJournal()

    expect(container.querySelector('[data-testid="journal-chart"]')).toBeDefined()
    expect(container.querySelector('input#add_entry')).toBeDefined()

    unmount()
  })

  it('renders the entry form after clicking Add Entry', () => {
    const { container, unmount } = renderJournal()
    const addEntryButton = container.querySelector('input#add_entry')

    act(() => {
      addEntryButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(addEntryButton.value).toBe('-')
    expect(container.querySelector('[data-testid="entry-form-submit"]')).toBeDefined()

    unmount()
  })

  it('dispatches update and reload when the journal form submits', () => {
    const { container, unmount } = renderJournal()

    act(() => {
      container.querySelector('[data-testid="journal-form-submit"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(updateJournal).toHaveBeenCalledWith('1', {
      name: 'Updated Journal',
      description: 'updated description',
      unit: 'dKH'
    })
    expect(fetchJournal).toHaveBeenCalledWith('1')
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: 'UPDATE_JOURNAL',
      id: '1',
      payload: {
        name: 'Updated Journal',
        description: 'updated description',
        unit: 'dKH'
      }
    })
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: 'FETCH_JOURNAL', id: '1' })

    unmount()
  })

  it('dispatches record and usage refresh when the entry form submits', () => {
    const { container, unmount } = renderJournal()

    act(() => {
      container.querySelector('input#add_entry').dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    act(() => {
      container.querySelector('[data-testid="entry-form-submit"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(recordJournal).toHaveBeenCalledWith('1', { value: '8.2', comment: 'daily check' })
    expect(fetchJournalUsage).toHaveBeenCalledWith('1')
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: 'RECORD_JOURNAL',
      id: '1',
      payload: { value: '8.2', comment: 'daily check' }
    })
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: 'FETCH_JOURNAL_USAGE', id: '1' })
    expect(container.querySelector('input#add_entry').value).toBe('journal:add_entry')

    unmount()
  })
})
