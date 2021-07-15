export const PercentOf = (value, ref) => {
  if (Number.isNaN(value)) {
    return 'NaN'
  } else {
    return (parseFloat(value)/parseFloat(ref)*100).toFixed(0)
  }
}
