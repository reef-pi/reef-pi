export function setAlert (type, content) {
  return { type: type, content: content, ts: new Date().getTime() }
}
