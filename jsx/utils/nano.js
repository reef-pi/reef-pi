const secondInNano = 1000000000
const minuteInNano = secondInNano * 60

export const secondsToNano = (seconds) => seconds * secondInNano
export const secondsFromNano = (nano) => nano / secondInNano
export const secondsParseToNano = (secondsString) => secondsToNano(parseFloat(secondsString).toFixed(1))

export const minutesToNano = (minutes) => minutes * minuteInNano
export const minutesFromNano = (nano) => nano / minuteInNano
export const minutesParseToNano = (minutesString) => minutesToNano(parseFloat(minutesString).toFixed(1))

export default {secondsToNano, secondsFromNano, secondsParseToNano, minutesToNano, minutesFromNano}