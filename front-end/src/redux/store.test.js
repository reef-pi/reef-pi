describe('redux store ownership', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('does not create a store before one is registered', () => {
    const { getStore } = require('./store')

    expect(getStore()).toBeUndefined()
  })

  it('returns the registered store', () => {
    const { getStore, setStore } = require('./store')
    const store = { dispatch: jest.fn(), getState: jest.fn() }

    expect(setStore(store)).toBe(store)
    expect(getStore()).toBe(store)
  })
})
