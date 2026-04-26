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

  it('maps defaults and submits', () => {
    const onSubmit = jest.fn()

    expect(mapJournalPropsToValues({})).toEqual({
      name: '',
      description: '',
      unit: ''
    })

    submitJournalForm({ name: 'alk' }, { onSubmit })
    expect(onSubmit).toHaveBeenCalledWith({ name: 'alk' })
  })
})
