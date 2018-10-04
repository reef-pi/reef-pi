import { configureStore } from 'redux/store'
import { setUILog } from 'logCenter/log'
import { addLog } from 'redux/actions/log'
export function showAlert(msg) {
  console.warn('showAlert Method is deprecated. Please use notifications/alert')
  configureStore().dispatch(addLog(setUILog('ERROR', msg)))
}

export function clearAlert() {
  console.warning('clearAlert is deprecated.')
}
