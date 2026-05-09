import { ParseTimestamp, filterToday, formatChartTime, timestampToEpoch } from './timestamp'

describe('ParseTimestamp', () => {
  it('parses timestamp string into a Date', () => {
    const d = ParseTimestamp('Jul-08-23:38, 2022')
    expect(d).toBeInstanceOf(Date)
    expect(d.getFullYear()).toBe(2022)
    expect(d.getMonth()).toBe(6) // July = 6
    expect(d.getDate()).toBe(8)
    expect(d.getHours()).toBe(23)
    expect(d.getMinutes()).toBe(38)
  })

  it('parses January correctly', () => {
    const d = ParseTimestamp('Jan-01-00:00, 2023')
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(1)
  })

  it('parses December correctly', () => {
    const d = ParseTimestamp('Dec-31-12:59, 2021')
    expect(d.getMonth()).toBe(11)
    expect(d.getDate()).toBe(31)
  })
})

describe('timestampToEpoch', () => {
  it('returns the epoch milliseconds for reef-pi timestamps', () => {
    const timestamp = 'Jul-08-23:38, 2022'

    expect(timestampToEpoch(timestamp)).toBe(ParseTimestamp(timestamp).getTime())
  })
})

describe('formatChartTime', () => {
  it('formats chart epochs as zero-padded local hours and minutes', () => {
    const epoch = new Date(2022, 6, 8, 3, 4).getTime()

    expect(formatChartTime(epoch)).toBe('03:04')
  })
})

describe('filterToday', () => {
  it('returns only readings from today', () => {
    const now = new Date()
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()]
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const min = String(now.getMinutes()).padStart(2, '0')
    const year = now.getFullYear()
    const todayTimestamp = `${month}-${day}-${hour}:${min}, ${year}`

    const readings = [
      { time: todayTimestamp },
      { time: 'Jan-01-00:00, 2000' }
    ]
    const result = filterToday(readings)
    expect(result).toHaveLength(1)
    expect(result[0].time).toBe(todayTimestamp)
  })

  it('returns empty array when no readings match today', () => {
    const readings = [{ time: 'Jan-01-00:00, 2000' }]
    expect(filterToday(readings)).toHaveLength(0)
  })

  it('returns all readings when all are from today', () => {
    const now = new Date()
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()]
    const day = String(now.getDate()).padStart(2, '0')
    const year = now.getFullYear()
    const ts1 = `${month}-${day}-10:00, ${year}`
    const ts2 = `${month}-${day}-14:30, ${year}`

    const readings = [{ time: ts1 }, { time: ts2 }]
    expect(filterToday(readings)).toHaveLength(2)
  })
})
