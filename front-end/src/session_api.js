export function isSignedIn () {
  return fetch('/api/me', {
    method: 'GET',
    credentials: 'same-origin'
  }).then(r => {
    return r.ok
  })
}

export function signOut () {
  return fetch('/auth/signout', {
    method: 'GET',
    credentials: 'same-origin'
  })
}

export function signIn (creds) {
  return fetch('/auth/signin', {
    method: 'POST',
    credentials: 'same-origin',
    body: JSON.stringify(creds)
  })
}
