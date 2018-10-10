import { configureStore } from 'redux/store'
import { setUILog } from 'logCenter/log'
import { addLog } from 'redux/actions/log'
import { MsgLevel } from 'utils/enums'
export function logInfo (msg) {
  _writeLog(MsgLevel.info, msg)
}
export function logError (msg) {
  _writeLog(MsgLevel.error, msg)
}
export function logSuccess (msg) {
  _writeLog(MsgLevel.success, msg)
}
export function logWarning (msg) {
  _writeLog(MsgLevel.warning, msg)
}
function _writeLog (type, msg) {
  configureStore().dispatch(addLog(setUILog(type, msg)))
}
