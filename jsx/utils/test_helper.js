export const mockLocalStorage = () => {
  var storage = {}
  return ({
    getItem: (k) => {
      return storage[k]
    },
    setItem: (k, v) => {
      storage[k] = v
    }
  })
}
