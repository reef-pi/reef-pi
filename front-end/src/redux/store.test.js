import { configureStore } from './store'

describe('redux store ownership', () => {
  it('creates a Redux store with the initial app state', () => {
    const store = configureStore()

    expect(store.dispatch).toEqual(expect.any(Function))
    expect(store.getState()).toEqual(expect.objectContaining({
      info: expect.any(Object),
      errors: expect.any(Array),
      capabilities: expect.any(Object)
    }))
  })
})
