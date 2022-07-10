const months = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12'
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
