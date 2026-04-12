import { addLog, delLog } from './log'

describe('log actions', () => {
  it('addLog returns correct type', () => {
    expect(addLog({}).type).toBe('LOG_ADDED')
  })

  it('addLog includes payload', () => {
    const log = { id: 1, msg: 'test' }
    expect(addLog(log).payload).toBe(log)
  })

  it('delLog returns correct type', () => {
    expect(delLog({}).type).toBe('LOG_DELETED')
  })

  it('delLog includes payload', () => {
    const log = { id: 2 }
    expect(delLog(log).payload).toBe(log)
  })
})
