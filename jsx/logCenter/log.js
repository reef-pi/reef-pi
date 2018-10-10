export const LogEmitter = {
  api: 'API',
  ui: 'UI'
}
/**
 * Generate an UI Log object to dispatch to redux
 * @param {LogType} type Type of the log
 * @param {String} content Content of the log
 * @returns {Log} Log ready to be dispatched to the redux store
 */
export function setUILog (type, content) {
  return _setLog(LogEmitter.ui, type, content)
}
/**
 * Generate an API Log object to dispatch to redux
 * @param {LogType} type Type of the log
 * @param {String} content Content of the log
 * @returns {Log} Log ready to be dispatched to the redux store
 */
export function setAPILog (type, content) {
  return _setLog(LogEmitter.api, type, content)
}
function _setLog (emitter, type, content) {
  return { type: type, emitter: emitter, content: content, ts: new Date().getTime() }
}
