import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'
import Journal from './journal'
import 'isomorphic-fetch'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn()
}))

jest.mock('./entry_form', () => () => <div data-testid='entry-form' />)
jest.mock('./chart', () => () => <div data-testid='chart' />)
jest.mock('./form', () => () => <div data-testid='journal-form' />)

const { useDispatch } = jest.requireMock('react-redux')

const config = { id: '1', name: 'pH Log', description: 'daily', unit: 'pH' }

describe('<Journal />', () => {
  const renderJournal = (extraProps = {}) => {
    const dispatch = jest.fn()
    useDispatch.mockReturnValue(dispatch)
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    let renderer
    act(() => {
      renderer = TestRenderer.create(
        <Journal config={config} readOnly={false} expanded={false} {...extraProps} />
      )
    })
    return { renderer, dispatch }
  }

  const findByProps = (root, props) => {
    return root.find(node => Object.entries(props).every(([key, value]) => node.props && node.props[key] === value))
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without throwing', () => {
    expect(() => renderJournal()).not.toThrow()
  })

  it('renders Add Entry button', () => {
    const { renderer } = renderJournal()
    const btn = findByProps(renderer.root, { id: 'add_entry' })
    expect(btn.props.value).toBeDefined()
  })

  it('renders entry form after clicking Add Entry', () => {
    const { renderer } = renderJournal()
    const btn = findByProps(renderer.root, { id: 'add_entry' })
    act(() => {
      btn.props.onClick()
    })
    const toggled = findByProps(renderer.root, { id: 'add_entry' })
    expect(toggled.props.value).toBe('-')
    expect(renderer.root.findAll(node => node.props && node.props['data-testid'] === 'entry-form')).toHaveLength(1)
  })

  it('renders in readOnly mode', () => {
    const { renderer } = renderJournal({ readOnly: true })
    const btn = findByProps(renderer.root, { id: 'add_entry' })
    expect(btn.props.className).toBe('btn btn-outline-success')
  })
})
