import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import {ajaxGet} from './utils/ajax.js'

export default class JackSelector extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      jacks: [],
      jack: undefined,
      pin: undefined
    }
    this.fetch = this.fetch.bind(this)
    this.jacks = this.jacks.bind(this)
    this.setJack = this.setJack.bind(this)
    this.pins = this.pins.bind(this)
    this.setPin = this.setPin.bind(this)
  }

  componentDidMount () {
    this.fetch()
  }

  fetch () {
    ajaxGet({
      url: '/api/jacks',
      success: function (data) {
        var jack
        $.each(data, function (i, j) {
          if (this.props.id === j.id) {
            jack = j
          }
        }.bind(this))
        this.setState({
          jacks: data,
          jack: jack,
          pin: jack === undefined ? undefined : jack.pins[0]
        })
      }.bind(this)
    })
  }

  jacks () {
    var title = ''
    var id = ''
    if (this.state.jack !== undefined) {
      title = this.state.jack.name
      id = this.state.jack.id
    }
    var items = []
    $.each(this.state.jacks, function (k, v) {
      items.push(<MenuItem key={k} active={v.id === id} eventKey={k}><span id={this.props.id + '-' + v.name}>{v.name}</span></MenuItem>)
    }.bind(this))
    return (
      <DropdownButton title={title} id={this.props.id + 'jack'} onSelect={this.setJack}>
        {items}
      </DropdownButton>
    )
  }

  setJack (k, ev) {
    var j = this.state.jacks[k]
    if (j === undefined) {
      return
    }
    this.setState({
      jack: j,
      pin: j.pins[0]
    })
    this.props.update(j.id, j.pins[0])
  }

  setPin (k, ev) {
    this.setState({
      pin: k
    })
    this.props.update(this.state.jack.id, k)
  }

  pins () {
    if (this.state.jack === undefined) {
      return
    }
    var items = []
    $.each(this.state.jack.pins, function (k, v) {
      items.push(<MenuItem key={k} eventKey={v}>{v}</MenuItem>)
    })
    return (
      <DropdownButton title={this.state.pin.toString()} id={this.props.id + 'pin'} onSelect={this.setPin}>
        {items}
      </DropdownButton>
    )
  }

  render () {
    return (
      <div className='container'>
        Jack
        {this.jacks()}
        Pins
        {this.pins()}
      </div>
    )
  }
}
