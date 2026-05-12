import EntryForm, { mapEntryPropsToValues, submitEntryForm } from './entry_form'

describe('<EntryForm />', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('maps defaults with generated timestamp', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2024, 0, 2, 15, 4))

    const values = mapEntryPropsToValues({})

    expect(values).toEqual({
      value: '',
      comment: '',
      timestamp: 'Jan-02-15:04, 2024'
    })
    expect(EntryForm).toBeDefined()
  })

  it('preserves explicit entry data', () => {
    const data = { value: '7.4', comment: 'after water change', timestamp: 'Jan-01-10:00, 2024' }

    expect(mapEntryPropsToValues({ data })).toEqual(data)
  })

  it('fills missing explicit data fields with defaults', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2024, 5, 3, 9, 8))

    expect(mapEntryPropsToValues({ data: { value: '8.1' } })).toEqual({
      value: '8.1',
      comment: '',
      timestamp: 'Jun-03-09:08, 2024'
    })
  })

  it('submits mapped values to the caller', () => {
    const onSubmit = jest.fn()
    const data = { value: '7.4', comment: 'after water change', timestamp: 'Jan-01-10:00, 2024' }

    submitEntryForm(data, { onSubmit })
    expect(onSubmit).toHaveBeenCalledWith(data)
  })
})
