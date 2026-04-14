import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Main, { MainView } from './main'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

jest.mock('./new', () => () => <li>new journal</li>)
jest.mock('./journal', () => ({ config }) => <div>{config.name}</div>)

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockImplementation(() => Promise.resolve(true))
}))

const journals = [
  { id: '1', name: 'pH Log', description: 'daily', unit: 'pH' },
  { id: '2', name: 'Alkalinity', description: 'weekly', unit: 'dKH' }
]

describe('<Main />', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('renders without throwing with journals', () => {
    expect(() => renderToStaticMarkup(
      <MainView journals={journals} fetchJournals={() => {}} delete={() => {}} />
    )).not.toThrow()
  })

  it('renders without throwing with empty journals', () => {
    expect(() => renderToStaticMarkup(
      <MainView journals={[]} fetchJournals={() => {}} delete={() => {}} />
    )).not.toThrow()
  })

  it('lists journals in sorted order and deletes by confirmation', async () => {
    const del = jest.fn()
    const view = new MainView({ journals, fetchJournals: () => {}, delete: del })
    const items = view.list()
    expect(items).toHaveLength(2)
    expect(items[0].props.item.name).toBe('Alkalinity')
    expect(items[1].props.item.name).toBe('pH Log')

    view.handleDelete(items[1].props.item)
    await Promise.resolve()
    expect(del).toHaveBeenCalledWith('1')
    expect(Main).toBeDefined()
  })
})
