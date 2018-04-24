import React from 'react'

export default class Notify extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: this.props.config
    }
    this.updateEnable = this.updateEnable.bind(this)
    this.update = this.update.bind(this)
  }

  updateEnable(ev) {
    var h = this.state.config
    h.enable = ev.target.checked
    this.setState({
      config:h
    })
    this.props.updateHook(h)
  }

  update(k) {
    return(function(ev){
      var h = this.state.config
      h[k] = parseFloat(ev.target.value)
      this.setState({
       config: h
      })
      this.props.updateHook(h)
    }.bind(this))
  }

  render() {
    return(
      <div className='col-sm-3'>
        <label className='form-check-label'>
        <input className='form-check-input'
          type='checkbox'
          id='tc_notify_enable'
          defaultChecked={this.state.config.enable}
          onClick={this.updateEnable}
          disabled={this.props.readOnly}
        />
        <b>Enable alerting</b>
      </label>
      <div className='input-group' key='tc_notify_min'>
        <label className='input-group-addon'>Min</label>
        <input type='text'
          className='form-control'
          id='tc_notify_min'
          value={this.state.config.min}
          onChange={this.update('min')}
          disabled={this.props.readOnly}
        />
      </div>
      <div className='input-group' key='tc_notify_max'>
        <label className='input-group-addon'>Max</label>
        <input
          className='form-control'
          type='text'
          id='tc_notify_max'
          value={this.state.config.max}
          onChange={this.update('max')}
          disabled={this.props.readOnly}
        />
      </div>
    </div>
    )
  }
}
