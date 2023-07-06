import { configureStore } from 'redux/store'
import { setAlert } from 'notifications/statics'
import { addAlert, delAlert} from 'redux/actions/alert'
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
export function showUpdateSuccessful () {
  let alert = _showAlert(MsgLevel.success, "Update successful")
  setTimeout(() => {
    // only show alert for a second to not block page content
    configureStore().dispatch(delAlert(alert))
  }, 1000)
}
function _showAlert (type, msg) {
  let alert = setAlert(type, msg) 
  configureStore().dispatch(addAlert(alert))
  return alert
}
export function showAlert (msg) {
  console.warn('showAlert is deprecated. Please Use showError')
  showError(msg)
}
export function clearAlert () {
  console.warn('clearAlert is deprecated.')
}
