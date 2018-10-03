import React from 'react'
import { connect } from 'react-redux'

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
class LogCenter extends React.Component {
  constructor (props) {
    super(props)
  }
  getTrClass (n) {
    let cssClass = ''
    switch (n.type) {
      case LogType.info:
        cssClass = 'table-info'
        break
      case LogType.error:
        cssClass = 'table-danger'
        break
      case LogType.success:
        cssClass = 'table-success'
        break
      case LogType.warning:
        cssClass = 'table-warning'
        break
    }
    return cssClass
  }
  readableDate (ts) {
    const d = new Date(ts)
    return d.toLocaleString()
  }
  render () {
    let n = []
    this.props.logs.forEach(e => {
      n.push(
        <tr className={this.getTrClass(e) + ' log-entry'} key={e.ts}>
          <td>{this.readableDate(e.ts)}</td>
          <td>{e.emitter}</td>
          <td>{e.type}</td>
          <td>{e.content}</td>
        </tr>
      )
    })
    return (
      <React.Fragment>
        <div className='row' key='content'>
          <div className='col'>
            <table className='table table-sm table-striped'>
              <thead>
                <tr>
                  <th scope='col'>Time</th>
                  <th scope='col'>Emitter</th>
                  <th scope='col'>Type</th>
                  <th scope='col'>Content</th>
                </tr>
              </thead>
              <tbody>{n}</tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    )
  }
}
const mapStateToProps = state => {
  return {
    logs: state.logs
  }
}
const log = connect(
  mapStateToProps,
  null
)(LogCenter)
export default log
