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
    this.updateEnable = this.updateEnable.bind(this)
  }

  updateEnable (ev) {
    var h = this.state.notify
    h.enable = ev.target.checked
    this.setState({notify: h})
    this.props.update(h)
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
    var ct = [
      <div className='form-check' key='health_notify_enable'>
        <label className='form-check-label'>
          <input
            className='form-check-input'
            type='checkbox'
            id='health_notify_enable'
            defaultChecked={this.state.notify.enable}
            onClick={this.updateEnable} />
          <b>Alert on health check</b>
        </label>
      </div>
    ]
    if (this.state.notify.enable) {
      ct.push(
        <div className='input-group' key='health_notify_max_memory'>
          <label className='input-group-addon'>Max Memory</label>
          <input
            type='text'
            className='form-control'
            id='health_max_memory'
            value={this.state.notify.max_memory}
            onChange={this.update('max_memory')} />
        </div>
    )
      ct.push(
        <div className='input-group' key='health_notify_max_cpu'>
          <label className='input-group-addon'>Max CPU</label>
          <input
            type='text'
            className='form-control'
            id='health_max_cpu'
            value={this.state.notify.max_cpu}
            onChange={this.update('max_cpu')} />
        </div>
        )
    }
    return (
      <div className='col-sm-3'>
        {ct}
      </div>
    )
  }
}
