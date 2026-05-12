import JournalForm, { mapJournalPropsToValues, submitJournalForm } from './form'
import 'isomorphic-fetch'

describe('<JournalForm />', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('maps explicit journal data', () => {
    const data = { id: '1', name: 'pH Log', description: 'daily', unit: 'pH' }

    expect(mapJournalPropsToValues({ data })).toEqual({
      name: 'pH Log',
      description: 'daily',
      unit: 'pH'
    })
    expect(JournalForm).toBeDefined()
  })

  it('maps defaults when no journal data is supplied', () => {
    expect(mapJournalPropsToValues({})).toEqual({
      name: '',
      description: '',
      unit: ''
    })
  })

  it('fills missing journal data fields with empty strings', () => {
    expect(mapJournalPropsToValues({ data: { name: 'Alkalinity' } })).toEqual({
      name: 'Alkalinity',
      description: '',
      unit: ''
    })
  })

  it('submits values to the caller', () => {
    const onSubmit = jest.fn()

    submitJournalForm({ name: 'alk' }, { onSubmit })
    expect(onSubmit).toHaveBeenCalledWith({ name: 'alk' })
  })
})
