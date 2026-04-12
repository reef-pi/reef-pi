import { addAlert, delAlert } from './alert'

describe('alert actions', () => {
  it('addAlert returns correct type', () => {
    expect(addAlert({}).type).toBe('ALERT_ADDED')
  })

  it('addAlert includes payload', () => {
    const alert = { id: 1, msg: 'test' }
    expect(addAlert(alert).payload).toBe(alert)
  })

  it('delAlert returns correct type', () => {
    expect(delAlert({}).type).toBe('ALERT_DELETED')
  })

  it('delAlert includes payload', () => {
    const alert = { id: 2, msg: 'bye' }
    expect(delAlert(alert).payload).toBe(alert)
  })
})
