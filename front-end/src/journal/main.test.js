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

describe('<Main />', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders journal panels in name order without mutating props', () => {
    const main = new RawJournalMain({ journals, delete: jest.fn() })
    const originalJournals = journals.map(journal => ({ ...journal }))
    const rendered = main.render()
    const panels = findAll(rendered, node => node.type === Collapsible)

    expect(panels).toHaveLength(2)
    expect(panels.map(panel => panel.props.name)).toEqual(['panel-journal-2', 'panel-journal-1'])
    expect(panels.map(panel => panel.props.item.name)).toEqual(['Alkalinity', 'pH Log'])
    expect(panels.map(panel => panel.props.onDelete)).toEqual([main.handleDelete, main.handleDelete])
    expect(journals).toEqual(originalJournals)
  })

  it('renders with empty journal list', () => {
    const main = new RawJournalMain({ journals: [], delete: jest.fn() })
    const rendered = main.render()

    expect(findAll(rendered, node => node.type === Collapsible)).toHaveLength(0)
  })

  it('renders New sub-component for adding journals', () => {
    const main = new RawJournalMain({ journals, delete: jest.fn() })
    const rendered = main.render()

    expect(findAll(rendered, node => node.type === New)).toHaveLength(1)
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
