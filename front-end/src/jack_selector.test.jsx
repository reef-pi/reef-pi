import JackSelector, { JackSelectorView } from './jack_selector'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

describe('JackSelector', () => {
  it('<JackSelectorView /> renders and updates jack/pin', () => {
    const jacks = [{ id: '1', name: 'Foo', pins: [1, 2] }]
    const update = jest.fn()
    const fetchJacks = jest.fn()
    const selector = new JackSelectorView({ id: '1', jacks, update, fetchJacks })
    selector.setState = jest.fn(next => {
      selector.state = { ...selector.state, ...next }
    })

    selector.componentDidMount()
    expect(fetchJacks).toHaveBeenCalled()
    expect(() => renderToStaticMarkup(<JackSelectorView id='1' jacks={jacks} update={update} fetchJacks={fetchJacks} />)).not.toThrow()
    selector.setJack(0)()
    expect(update).toHaveBeenCalledWith('1', 1)
    selector.setPin(2)()
    expect(update).toHaveBeenCalledWith('1', 2)
    expect(JackSelector).toBeDefined()
  })
})
