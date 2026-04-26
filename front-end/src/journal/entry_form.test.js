import EntryForm, { mapEntryPropsToValues, submitEntryForm } from './entry_form'

describe('<EntryForm />', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('maps defaults with generated timestamp', () => {
    const values = mapEntryPropsToValues({})

    expect(values.value).toBe('')
    expect(values.comment).toBe('')
    expect(values.timestamp).toMatch(/^[A-Z][a-z]{2}-\d{2}-\d{2}:\d{2}, \d{4}$/)
    expect(EntryForm).toBeDefined()
  })

  it('maps explicit data and submits', () => {
    const onSubmit = jest.fn()
    const data = { value: '7.4', comment: 'after water change', timestamp: 'Jan-01-10:00, 2024' }

    expect(mapEntryPropsToValues({ data })).toEqual(data)
    submitEntryForm(data, { onSubmit })
    expect(onSubmit).toHaveBeenCalledWith(data)
  })
})
