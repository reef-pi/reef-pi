import { validateDriver } from './api'
import { nonReduxRequest } from '../utils/ajax'

jest.mock('../utils/ajax', () => ({
  nonReduxRequest: jest.fn()
}))

describe('drivers api', () => {
  beforeEach(() => {
    nonReduxRequest.mockClear()
  })

  it('validateDriver posts the payload to the validation endpoint', () => {
    const payload = {
      name: 'pca',
      type: 'pca9685',
      config: {
        address: 64,
        frequency: 1000
      }
    }
    const response = Promise.resolve({ status: 200 })
    nonReduxRequest.mockReturnValue(response)

    expect(validateDriver(payload)).toBe(response)
    expect(nonReduxRequest).toHaveBeenCalledWith({
      url: 'api/drivers/validate',
      method: 'POST',
      data: payload
    })
  })
})
