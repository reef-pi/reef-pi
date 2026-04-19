import React from 'react'
import { RawJournalMain } from './main'
import Collapsible from '../ui_components/collapsible'
import New from './new'
import { confirm } from 'utils/confirm'
import 'isomorphic-fetch'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockImplementation(() => Promise.resolve(true))
}))

const journals = [
  { id: '1', name: 'pH Log', description: 'daily', unit: 'pH' },
  { id: '2', name: 'Alkalinity', description: 'weekly', unit: 'dKH' }
]

const countByType = (node, predicate) => {
  if (!node || typeof node !== 'object') {
    return 0
  }
  let count = predicate(node) ? 1 : 0
  React.Children.toArray(node.props?.children).forEach(child => {
    count += countByType(child, predicate)
  })
  return count
}

describe('<Main />', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without throwing', () => {
    const main = new RawJournalMain({ journals, delete: jest.fn() })
    expect(() => main.render()).not.toThrow()
  })

  it('renders with journal list', () => {
    const main = new RawJournalMain({ journals, delete: jest.fn() })
    const rendered = main.render()

    expect(countByType(rendered, node => node.type === Collapsible)).toBe(2)
  })

  it('renders with empty journal list', () => {
    const main = new RawJournalMain({ journals: [], delete: jest.fn() })
    const rendered = main.render()

    expect(countByType(rendered, node => node.type === Collapsible)).toBe(0)
  })

  it('renders New sub-component for adding journals', () => {
    const main = new RawJournalMain({ journals, delete: jest.fn() })
    const rendered = main.render()

    expect(countByType(rendered, node => node.type === New)).toBe(1)
  })

  it('calls delete after confirm resolves', async () => {
    const deleteJournal = jest.fn()
    const main = new RawJournalMain({ journals, delete: deleteJournal })

    await main.handleDelete(journals[0])
    await Promise.resolve()

    expect(confirm).toHaveBeenCalled()
    expect(deleteJournal).toHaveBeenCalledWith(journals[0].id)
  })
})
