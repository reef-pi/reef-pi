import React, { useState } from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { useDatepicker } from './useDatepicker'

const TestComponent = ({ name }) => {
  const [handleChangeRaw, handleChange] = useDatepicker(name)
  const [value, setValue] = useState('')

  const handleChangeWrapper = (e) => {
    handleChangeRaw(e)
    setValue(e.target.value)
  }

  return (
    <input
      name={name}
      value={value}
      onChange={handleChangeWrapper}
    />
  )
}

describe('useDatepicker', () => {
  it('returns two handler functions', () => {
    const { result } = renderHook(() => useDatepicker('date'))
    expect(typeof result.current[0]).toBe('function')
    expect(typeof result.current[1]).toBe('function')
  })

  it('handleChangeRaw accepts valid date characters', () => {
    const { getByLabelText } = render(<TestComponent name="date" />)
    const input = getByLabelText('date')
    fireEvent.change(input, { target: { value: '01/01/2023' } })
    expect(input.value).toBe('01/01/2023')
  })

  it('handleChangeRaw calls preventDefault for invalid chars', () => {
    const { getByLabelText } = render(<TestComponent name="date" />)
    const input = getByLabelText('date')
    fireEvent.change(input, { target: { value: 'abc!@#' } })
    expect(input.value).toBe('')
  })

  it('handleChange accepts a valid Date object', async () => {
    const { getByLabelText } = render(<TestComponent name="date" />)
    const input = getByLabelText('date')
    const validDate = new Date(2023, 0, 1)
    await fireEvent.change(input, { target: { value: validDate.toISOString() } })
    expect(input.value).toBe(validDate.toISOString())
  })

  it('handleChange handles null date gracefully', async () => {
    const { getByLabelText } = render(<TestComponent name="date" />)
    const input = getByLabelText('date')
    await fireEvent.change(input, { target: { value: null } })
    expect(input.value).toBe('')
  })

  it('handleChange handles invalid date string gracefully', async () => {
    const { getByLabelText } = render(<TestComponent name="date" />)
    const input = getByLabelText('date')
    await fireEvent.change(input, { target: { value: 'not-a-date' } })
    expect(input.value).toBe('')
  })
})
