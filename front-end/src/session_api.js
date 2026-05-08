import { nonReduxRequest } from './utils/ajax'

export function isSignedIn () {
  return nonReduxRequest({
    url: '/api/me',
    method: 'GET'
  }).then(r => {
    return r.ok
  })
}

export function signOut () {
  return nonReduxRequest({
    url: '/auth/signout',
    method: 'GET'
  })
}

export function signIn (creds) {
  return nonReduxRequest({
    url: '/auth/signin',
    method: 'POST',
    data: creds
  })
}
