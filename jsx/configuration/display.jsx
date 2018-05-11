import React from 'react'
import {ajaxGet, ajaxPost} from '../utils/ajax.js'
import {hideAlert} from '../utils/alert.js'

export default class Display extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      brightness: 100,
      on: undefined
    }
    this.toggle = this.toggle.bind(this)
    this.setBrightness = this.setBrightness.bind(this)
    this.load = this.load.bind(this)
  }

  load () {
    ajaxGet({
      url: '/api/display',
      success: function (data) {
        this.setState({
          on: data.on,
          brightness: data.brightness
        })
        hideAlert()
      }.bind(this)
    })
  }

  componentWillMount () {
    this.load()
  }

  toggle () {
    var action = this.state.on ? 'off' : 'on'
    ajaxPost({
      url: '/api/display/' + action,
      success: function (data) {
        this.setState({
          on: !this.state.on
        })
        hideAlert()
      }.bind(this)
    })
  }

  setBrightness (ev) {
    var b = parseInt(ev.target.value)
    ajaxPost({
      url: '/api/display',
      data: JSON.stringify({
        brightness: b
      }),
      success: function (d) {
        this.setState({
          brightness: b
        })
        hideAlert()
      }.bind(this)
    })
  }

  render () {
    var style = 'btn btn-outline-success'
    var action = 'on'
    if (this.state.on) {
      style = 'btn btn-outline-danger'
      action = 'off'
    }
    return (
      <div className='container'>
        <div className='col-sm-1'><button onClick={this.toggle} type='button' className={style}> {action} </button> </div>
        <div className='col-sm-2'>Brightness</div>
        <div className='col-sm-6'><input type='range' onChange={this.setBrightness} style={{width: '100%'}} min={0} max={255} value={this.state.brightness} /></div>
      </div>
    )
  }
}
