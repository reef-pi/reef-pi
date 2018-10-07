export const LogType = {
  info: 'INFO',
  error: 'ERROR',
  success: 'SUCCESS',
  warning: 'WARNING'
}
export const LogEmitter = {
  api: 'API',
  ui: 'UI'
}
/**
 * Generate an UI Log object to dispatch to redux
 * @param {LogType} type Type of the log
 * @param {String} content Content of the log
 * @param {Boolean} [display=true] Display a notification on the UI
 * @returns {Log} Log ready to be dispatched to the redux store
 */
export function setUILog (type, content, display = true) {
  return _setLog(LogEmitter.ui, type, content, display)
}
/**
 * Generate an API Log object to dispatch to redux
 * @param {LogType} type Type of the log
 * @param {String} content Content of the log
 * @param {Boolean} [display=true] Display a notification on the UI
 * @returns {Log} Log ready to be dispatched to the redux store
 */
export function setAPILog (type, content, display = true) {
  return _setLog(LogEmitter.api, type, content, display)
}
function _setLog (emitter, type, content, display) {
  return { type: type, emitter: emitter, content: content, display: display, ts: new Date().getTime() }
}
