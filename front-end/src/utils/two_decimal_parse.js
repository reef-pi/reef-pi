export const TwoDecimalParse = (value) => {
  if (Number.isNaN(value)) {
    return 'NaN'
  } else {
    return parseFloat(value).toFixed(2)
  }
}
