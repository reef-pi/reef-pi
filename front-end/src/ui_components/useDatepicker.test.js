import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { useFormikContext } from 'formik'
import { useDatepicker } from './useDatepicker'

jest.mock('formik', () => ({
  useFormikContext: jest.fn()
}))

const TestComponent = ({ name, onHandlers }) => {
  const [handleChangeRaw, handleChange] = useDatepicker(name)
  onHandlers({ handleChangeRaw, handleChange })
  return null
}

describe('useDatepicker', () => {
  let container
  let root
  let setFieldValue
  let setFieldTouched
  let handlers

  const renderHook = name => {
    act(() => {
      root.render(
        <TestComponent
          name={name}
          onHandlers={nextHandlers => {
            handlers = nextHandlers
          }}
        />
      )
    })
  }

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    setFieldValue = jest.fn().mockResolvedValue(undefined)
    setFieldTouched = jest.fn()
    handlers = undefined
    useFormikContext.mockReturnValue({
      setFieldValue,
      setFieldTouched
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    jest.clearAllMocks()
  })

  afterAll(() => {
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  })

  it('returns two handler functions', () => {
    renderHook('date')

    expect(typeof handlers.handleChangeRaw).toBe('function')
    expect(typeof handlers.handleChange).toBe('function')
  })

  it('handleChangeRaw accepts valid date characters', () => {
    renderHook('date')
    const event = {
      target: { name: 'date', value: '01/01/2023' },
      preventDefault: jest.fn()
    }

    act(() => {
      handlers.handleChangeRaw(event)
    })

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(setFieldValue).toHaveBeenCalledWith('date', '01/01/2023')
    expect(setFieldTouched).toHaveBeenCalledWith('date', true)
  })

  it('handleChangeRaw calls preventDefault for invalid chars', () => {
    renderHook('date')
    const event = {
      target: { name: 'date', value: 'abc!@#' },
      preventDefault: jest.fn()
    }

    act(() => {
      handlers.handleChangeRaw(event)
    })

    expect(event.preventDefault).toHaveBeenCalled()
    expect(setFieldValue).not.toHaveBeenCalled()
  })

  it('handleChange accepts a valid Date object', async () => {
    renderHook('date')
    const validDate = new Date(2023, 0, 1)

    await act(async () => {
      await handlers.handleChange(validDate)
    })

    expect(setFieldValue).toHaveBeenCalledWith('date', validDate)
    expect(setFieldTouched).toHaveBeenCalledWith('date', true)
  })

  it('handleChange handles null date gracefully', async () => {
    renderHook('date')

    await act(async () => {
      await handlers.handleChange(null)
    })

    expect(setFieldValue).toHaveBeenCalledWith('date', '')
    expect(setFieldTouched).toHaveBeenCalledWith('date', true)
  })

  it('handleChange handles invalid date string gracefully', async () => {
    renderHook('date')

    await act(async () => {
      await handlers.handleChange('not-a-date')
    })

    expect(setFieldValue).toHaveBeenCalledWith('date', '')
    expect(setFieldTouched).toHaveBeenCalledWith('date', true)
  })
})
