import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import RangeSelector from './RangeSelector'
import ToggleSwitch from './ToggleSwitch'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('design-system RangeSelector and ToggleSwitch', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('initializes RangeSelector from storage and persists changes', () => {
    localStorage.setItem('reefpi.range.temp', '6h')
    const onChange = jest.fn()
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<RangeSelector scope='temp' options={['1h', '6h', '1d']} onChange={onChange} compact />)
    })

    expect(container.querySelector('input[value="6h"]').checked).toBe(true)

    act(() => {
      container.querySelector('input[value="1d"]').click()
      jest.advanceTimersByTime(250)
    })

    expect(onChange).toHaveBeenCalledWith('1d')
    expect(localStorage.getItem('reefpi.range.temp')).toBe('1d')

    act(() => root.unmount())
  })

  it('keeps RangeSelector in sync with a controlled value', () => {
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<RangeSelector value='1h' options={['1h', '6h']} scope='controlled' />)
    })
    expect(container.querySelector('input[value="1h"]').checked).toBe(true)

    act(() => {
      root.render(<RangeSelector value='6h' options={['1h', '6h']} scope='controlled' />)
    })
    expect(container.querySelector('input[value="6h"]').checked).toBe(true)

    act(() => root.unmount())
  })

  it('renders ToggleSwitch states and invokes the correct callbacks', () => {
    const request = jest.fn()
    const retry = jest.fn()
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<ToggleSwitch state='on' onRequestChange={request} />)
    })
    act(() => container.querySelector('button').click())
    expect(request).toHaveBeenCalledWith('off')

    act(() => {
      root.render(<ToggleSwitch state='off' onRequestChange={request} />)
    })
    act(() => container.querySelector('button').click())
    expect(request).toHaveBeenCalledWith('on')

    act(() => {
      root.render(<ToggleSwitch state='pending' onRequestChange={request} />)
    })
    expect(container.querySelector('button').disabled).toBe(true)

    act(() => {
      root.render(<ToggleSwitch state='error' onRetry={retry} errorMessage='Failed' />)
    })
    act(() => container.querySelector('button').click())
    expect(retry).toHaveBeenCalled()
    expect(container.textContent).toContain('Failed')

    act(() => root.unmount())
  })

  it('renders ToggleSwitch server markup for pending and error visuals', () => {
    expect(renderToStaticMarkup(<ToggleSwitch state='pending' />)).toContain('reefpi-spin')
    expect(renderToStaticMarkup(<ToggleSwitch state='error' errorMessage='Retry me' />)).toContain('Retry me')
  })
})
