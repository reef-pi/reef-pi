export const SortByName = (a, b) => {
  return a.name.localeCompare(b.name, navigator.languages[0] || navigator.language, { numeric: true, ignorePunctuation: true })
}
