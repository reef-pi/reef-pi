import New, { RawNewJournal } from './new'
import JournalForm from './form'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

const children = component => component.render().props.children

describe('<New />', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('renders collapsed without a journal form', () => {
    const component = new RawNewJournal({ createJournal: jest.fn() })
    expect(() => component.render()).not.toThrow()
    expect(children(component)[0].props.value).toBe('+')
    expect(children(component)[1]).toBeUndefined()
    expect(New).toBeDefined()
  })

  it('renders the journal form when expanded', () => {
    const component = new RawNewJournal({ createJournal: jest.fn() })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })
    children(component)[0].props.onClick()
    expect(children(component)[0].props.value).toBe('-')
    expect(children(component)[1].type).toBe(JournalForm)
    expect(children(component)[1].props.onSubmit).toBe(component.handleSubmit)
  })

  it('toggles expanded state and resets draft values', () => {
    const component = new RawNewJournal({ createJournal: jest.fn() })
    component.state = {
      name: 'old name',
      description: 'old description',
      unit: 'ppt',
      add: false
    }
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })
    component.handleToggle()
    expect(component.state).toEqual({
      name: '',
      description: '',
      unit: '',
      add: true
    })
    component.state.name = 'next name'
    component.state.description = 'next description'
    component.state.unit = 'dKH'
    component.handleToggle()
    expect(component.state).toEqual({
      name: '',
      description: '',
      unit: '',
      add: false
    })
  })

  it('submits only journal fields and collapses the form', () => {
    const createJournal = jest.fn()
    const component = new RawNewJournal({ createJournal })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })
    component.handleToggle()
    expect(component.state.add).toBe(true)
    component.handleSubmit({ id: 7, name: 'test', description: 'desc', unit: 'pH', ignored: true })
    expect(createJournal).toHaveBeenCalledWith({ name: 'test', description: 'desc', unit: 'pH' })
    expect(component.state.add).toBe(false)
  })
})
