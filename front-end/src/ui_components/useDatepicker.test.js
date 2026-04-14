import React from 'react'
import { mount } from 'enzyme'
import { Form, Formik } from 'formik'
import { useDatepicker } from './useDatepicker'


// Test component that exposes hook handlers via refs
const TestComponent = ({ name, onHandlers }) => {
  const [handleChangeRaw, handleChange] = useDatepicker(name)
  if (onHandlers) onHandlers({ handleChangeRaw, handleChange })
  return <input name={name} onChange={handleChangeRaw} />
}

const wrap = (name, onHandlers) => mount(
  <Formik initialValues={{ [name]: '' }} onSubmit={() => {}}>
    <Form>
      <TestComponent name={name} onHandlers={onHandlers} />
    </Form>
  </Formik>
)

describe('useDatepicker', () => {
  it('returns two handler functions', () => {
    let handlers
    wrap('date', (h) => { handlers = h })
    expect(typeof handlers.handleChangeRaw).toBe('function')
    expect(typeof handlers.handleChange).toBe('function')
  })

  it('handleChangeRaw accepts valid date characters', () => {
    let handlers
    wrap('date', (h) => { handlers = h })
    const event = {
      target: { name: 'date', value: '01/01/2023' },
      preventDefault: jest.fn()
    }
    expect(() => handlers.handleChangeRaw(event)).not.toThrow()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('handleChangeRaw calls preventDefault for invalid chars', () => {
    let handlers
    wrap('date', (h) => { handlers = h })
    const event = {
      target: { name: 'date', value: 'abc!@#' },
      preventDefault: jest.fn()
    }
    handlers.handleChangeRaw(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('handleChange accepts a valid Date object', async () => {
    let handlers
    wrap('date', (h) => { handlers = h })
    const validDate = new Date(2023, 0, 1)
    await expect(handlers.handleChange(validDate)).resolves.not.toThrow()
  })

  it('handleChange handles null date gracefully', async () => {
    let handlers
    wrap('date', (h) => { handlers = h })
    await expect(handlers.handleChange(null)).resolves.not.toThrow()
  })

  it('handleChange handles invalid date string gracefully', async () => {
    let handlers
    wrap('date', (h) => { handlers = h })
    await expect(handlers.handleChange('not-a-date')).resolves.not.toThrow()
  })
})
