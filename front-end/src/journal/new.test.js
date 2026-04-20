import New, { RawNewJournal } from './new'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

describe('<New />', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('renders without throwing', () => {
    const component = new RawNewJournal({ createJournal: jest.fn() })
    expect(() => component.render()).not.toThrow()
    expect(New).toBeDefined()
  })

  it('shows + initially', () => {
    const component = new RawNewJournal({ createJournal: jest.fn() })
    expect(component.render().props.children[0].props.value).toBe('+')
  })

  it('toggles to - on click', () => {
    const component = new RawNewJournal({ createJournal: jest.fn() })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })
    component.render().props.children[0].props.onClick()
    expect(component.render().props.children[0].props.value).toBe('-')
  })

  it('toggles state.add on button click', () => {
    const component = new RawNewJournal({ createJournal: jest.fn() })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })
    expect(component.state.add).toBe(false)
    component.handleToggle()
    expect(component.state.add).toBe(true)
    component.handleToggle()
    expect(component.state.add).toBe(false)
  })

  it('handleSubmit collapses the form', () => {
    const createJournal = jest.fn()
    const component = new RawNewJournal({ createJournal })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })
    component.handleToggle()
    expect(component.state.add).toBe(true)
    component.handleSubmit({ name: 'test', description: 'desc', unit: 'pH' })
    expect(createJournal).toHaveBeenCalledWith({ name: 'test', description: 'desc', unit: 'pH' })
    expect(component.state.add).toBe(false)
  })
})
