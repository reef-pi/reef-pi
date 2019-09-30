import { reduxPost } from '../../utils/ajax'

export const credsUpdated = () => {
  return ({
    type: 'CREDS_UPDATED'
  })
}

export const updateCreds = (creds) => {
  return (
    reduxPost({
      url: '/api/credentials',
      data: creds,
      success: credsUpdated
    }))
}
