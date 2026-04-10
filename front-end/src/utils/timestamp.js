const months = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
}

export const ParseTimestamp = (v) => {
  // "Jul-08-23:38, 2022"
  const month = v.slice(0, 3)
  const day = v.slice(4, 6)
  const hours = v.slice(7, 9)
  const minutes = v.slice(10, 12)
  const year = v.slice(14, 18)
  return new Date(year, months[month], day, hours, minutes)
}

export const filterToday = (readings) => {
  const today = new Date().toDateString()
  return readings.filter(r => ParseTimestamp(r.time).toDateString() === today)
}

export const timestampToEpoch = (v) => ParseTimestamp(v).getTime()

export const formatChartTime = (epoch) => {
  const d = new Date(epoch)
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}
