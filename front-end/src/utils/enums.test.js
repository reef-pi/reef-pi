import { MsgLevel } from './enums'

describe('MsgLevel', () => {
  it('has info level', () => {
    expect(MsgLevel.info).toBe('INFO')
  })

  it('has error level', () => {
    expect(MsgLevel.error).toBe('ERROR')
  })

  it('has success level', () => {
    expect(MsgLevel.success).toBe('SUCCESS')
  })

  it('has warning level', () => {
    expect(MsgLevel.warning).toBe('WARNING')
  })
})
