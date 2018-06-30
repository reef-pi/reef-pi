import React from 'react'
import $ from 'jquery'

export default class SelectSensor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      sensor: props.active
    }
    this.list = this.list.bind(this)
    this.set = this.set.bind(this)
  }

  list () {
    var menuItems = []
    if (this.state.sensor === undefined) {
      menuItems.push(<a key='none' className='dropdown-item active'>-</a>)
    }
    $.each(this.props.sensors, function (k, v) {
      var cName = 'dropdown-item'
      if (v === this.state.sensor) {
        cName += ' active'
      }
      menuItems.push(
        <a className={cName} key={k} onClick={this.set(k)}>
          <span id={this.props.id + '-' + v}>{v}</span>
        </a>
      )
    }.bind(this))
    return menuItems
  }

  set (k) {
    return () => {
      if (k === 'none') {
        this.setState({
          sensor: undefined
        })
        this.props.update('')
        return
      }
      var sensor = this.props.sensors[k]
      this.setState({
        sensor: sensor
      })
      this.props.update(sensor)
    }
  }

  render () {
    var readOnly = this.props.readOnly !== undefined ? this.props.readOnly : false
    var sensor = ''
    if (this.state.sensor !== undefined) {
      sensor = this.state.sensor
    }
    return (
      <div className='dropdown'>
        <button className='btn btn-secondary dropdown-toggle' type='button' id={this.props.id} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' disabled={readOnly}>
          {sensor}
        </button>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
          {this.list()}
        </div>
      </div>
    )
  }
}
