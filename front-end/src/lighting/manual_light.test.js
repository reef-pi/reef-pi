import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ManualLight from './manual_light'

describe('Lighting ui - Manual Control', () => {
  const light = {
    id: '1',
    channels: {
      '0': { name: 'Blue', value: 10 },
      '1': { name: 'White', value: 20 }
    }
  }

  it('shows a slider for each channel', () => {
    const fn = jest.fn()
    const html = renderToStaticMarkup(<ManualLight light={light} handleChange={fn} />)
    expect((html.match(/type="range"/g) || []).length).toBe(2)
  })

  it('does not change state for alpha values', () => {
    const fn = jest.fn()
    const manual = new ManualLight({ light, handleChange: fn })
    manual.setState = jest.fn(update => {
      manual.state = { ...manual.state, ...update }
    })

    manual.handleValueChange({ target: { name: '0', value: 'abc' } })
    expect(manual.state.channels[0].value).toBe(10)
    expect(fn).not.toHaveBeenCalled()
  })

  it('changes state for numeric values', () => {
    const fn = jest.fn()
    const manual = new ManualLight({ light: JSON.parse(JSON.stringify(light)), handleChange: fn })
    manual.setState = jest.fn(update => {
      manual.state = { ...manual.state, ...update }
    })
    manual.debouncedChange = jest.fn()

    manual.handleValueChange({ target: { name: '0', value: '44.5' } })
    expect(manual.state.channels[0].value).toBe('44.5')
    expect(manual.debouncedChange).toHaveBeenCalledWith('0', 44.5)
  })
})
