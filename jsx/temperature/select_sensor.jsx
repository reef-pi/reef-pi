import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import {ajaxGet} from '../utils/ajax.js'

export default class SelectSensor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      sensors: [],
      sensor: props.active
    }
    this.fetch = this.fetch.bind(this)
    this.list = this.list.bind(this)
    this.set = this.set.bind(this)
  }

  componentDidMount () {
    this.fetch()
  }

  fetch () {
    ajaxGet({
      url: '/api/tcs/sensors',
      success: function (data) {
        var sensor = this.state.sensor
        $.each(data, function (i, s) {
          if (s === sensor) {
            sensor = s
          }
        }.bind(this))
        this.setState({
          sensors: data,
        })
      }.bind(this)
    })
  }

  list () {
    var menuItems = []
    if(this.state.sensor === undefined){
      menuItems.push(<MenuItem key='none' active={true} eventKey='none'>-</MenuItem>)
    }
    $.each(this.state.sensors, function (k, v) {
      menuItems.push(
        <MenuItem
          key={k}
          active={v === this.state.sensor}
          eventKey={k}
        >
          <span id={this.props.id + '-' + v}>{v}</span>
        </MenuItem>
     )
    }.bind(this))
    return menuItems
  }

  set (k, ev) {
    if (k === 'none') {
      this.setState({
        sensor: undefined
      })
      this.props.update('')
      return
    }
    var sensor = this.state.sensors[k]
    this.setState({
      sensor: sensor
    })
    this.props.update(sensor)
  }

  render () {
    var readOnly = this.props.readOnly !== undefined ? this.props.readOnly : false
    var sensor = ''
    if (this.state.sensor !== undefined) {
      sensor = this.state.sensor
    }
    return (
      <div className='container'>
        <DropdownButton title={sensor} id={this.props.id} onSelect={this.set} disabled={readOnly}>
          {this.list()}
        </DropdownButton>
      </div>
    )
  }
}
