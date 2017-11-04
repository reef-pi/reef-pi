import React from 'react'

export default class HealthNotify extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      notify: {
        enable: props.state.enable,
        max_memory: props.state.max_memory,
        max_cpu: props.state.max_cpu
      }
    }
    this.update = this.update.bind(this)
    this.enable = this.enable.bind(this)
  }

  enable (ev) {
    var h = this.state.notify
    h.enable = ev.target.checked
    this.setState({notify: h})
  }

  update (key) {
    return (function (ev) {
      var h = this.state.notify
      h[key] = parseInt(ev.target.value)
      this.setState({notify: h})
      this.props.update(h)
    }.bind(this))
  }

  render () {
    return (
      <div className='container'>
        <div className='input-group'>
          <label className='input-group-addon'>Enable</label>
          <input
            className='form-control'
            type='checkbox'
            id='health_notify_enable'
            defaultChecked={this.state.notify.enable}
            onClick={this.enable} />
        </div>
        <div className='input-group'>
          <label className='input-group-addon'>Max Memory</label>
          <input
            type='text'
            className='form-control'
            id='health_max_memory'
            value={this.state.notify.max_memory}
            onChange={this.update('max_memory')} />
        </div>
        <div className='input-group'>
          <label className='input-group-addon'>Max CPU</label>
          <input
            type='text'
            className='form-control'
            id='health_max_cpu'
            value={this.state.notify.max_cpu}
            onChange={this.update('max_cpu')} />
        </div>
      </div>
    )
  }
}
