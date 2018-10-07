import React from 'react'
import { connect } from 'react-redux'
import { LogType } from './log'
class LogCenter extends React.Component {
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
