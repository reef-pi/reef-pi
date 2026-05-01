export const validateDriver = payload => {
  return fetch('api/drivers/validate', {
    method: 'POST',
    credentials: 'same-origin',
    body: JSON.stringify(payload)
  })
}
