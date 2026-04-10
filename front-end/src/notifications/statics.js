export function setAlert (type, content) {
  return { type, content, ts: new Date().getTime() }
}
