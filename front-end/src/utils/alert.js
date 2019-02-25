import { configureStore } from 'redux/store'
import { setAlert } from 'notifications/statics'
import { addAlert } from 'redux/actions/alert'
import { MsgLevel } from 'utils/enums'

export function showInfo (msg) {
  _showAlert(MsgLevel.info, msg)
}
export function showError (msg) {
  _showAlert(MsgLevel.error, msg)
}
export function showSuccess (msg) {
  _showAlert(MsgLevel.success, msg)
}
export function showWarning (msg) {
  _showAlert(MsgLevel.warning, msg)
}
function _showAlert (type, msg) {
  configureStore().dispatch(addAlert(setAlert(type, msg)))
}
export function showAlert (msg) {
  console.warn('showAlert is deprecated. Please Use showError')
  showError(msg)
}
export function clearAlert () {
  console.warn('clearAlert is deprecated.')
}
