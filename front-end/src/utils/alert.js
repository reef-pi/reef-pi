import { setAlert } from 'notifications/statics'
import { addAlert, delAlert } from 'redux/actions/alert'
import { MsgLevel } from 'utils/enums'
import i18n from 'utils/i18n'
import { dispatchAlert as dispatchToAlertCenter } from '../../design-system/ui_kits/reef-pi-app/hooks/useAlertsStore'

// Maps Redux MsgLevel to AlertCenter severity
function toSeverity (type) {
  if (type === MsgLevel.error)   return 'critical'
  if (type === MsgLevel.warning) return 'warn'
  return null // info + success don't surface in AlertCenter
}

let dispatchAlertAction

export function setAlertDispatcher (dispatch) {
  dispatchAlertAction = dispatch
  return dispatchAlertAction
}

export function clearAlertDispatcher () {
  dispatchAlertAction = undefined
}

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
  const alert = _showAlert(MsgLevel.success, i18n.t('save_successful'))
  setTimeout(() => {
    // only show alert for a second to not block page content
    _dispatchAlert(delAlert(alert))
  }, 1000)
}
function _showAlert (type, msg) {
  const alert = setAlert(type, msg)
  _dispatchAlert(addAlert(alert))
  if (window.FEATURE_FLAGS?.alert_center) {
    const severity = toSeverity(type)
    if (severity) {
      dispatchToAlertCenter({ severity, title: msg, ts: Date.now() })
    }
  }
  return alert
}
function _dispatchAlert (action) {
  if (dispatchAlertAction) {
    dispatchAlertAction(action)
  }
}
export function showAlert (msg) {
  console.warn('showAlert is deprecated. Please Use showError')
  showError(msg)
}
export function clearAlert () {
  console.warn('clearAlert is deprecated.')
}
