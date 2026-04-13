import React from 'react'
import { mount } from 'enzyme'
import EntryForm from './entry_form'


describe('<EntryForm />', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without throwing with no data (uses defaults)', () => {
    const onSubmit = jest.fn()
    expect(() =>
      mount(<EntryForm onSubmit={onSubmit} readOnly={false} />)
    ).not.toThrow()
  })

  it('renders without throwing with data', () => {
    const onSubmit = jest.fn()
    const data = { value: '7.4', comment: 'after water change', timestamp: 'Jan-01-10:00, 2024' }
    expect(() =>
      mount(<EntryForm data={data} onSubmit={onSubmit} readOnly={false} />)
    ).not.toThrow()
  })
})
