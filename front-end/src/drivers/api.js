import { nonReduxRequest } from '../utils/ajax'

export const validateDriver = payload => {
  return nonReduxRequest({
    url: 'api/drivers/validate',
    method: 'POST',
    data: payload
  })
}
