import { postAction } from './api'

export const credsUpdated = () => {
  return ({
    type: 'CREDS_UPDATED'
  })
}

export const updateCreds = (creds) => {
  return postAction('credentials', creds, credsUpdated)
}
