import React from 'react'

export default class Notify extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: this.props.config
    }
    this.updateEnable = this.updateEnable.bind(this)
    this.update = this.update.bind(this)
    this.minMax = this.minMax.bind(this)
  }

  updateEnable (ev) {
    var h = this.state.config
    h.enable = ev.target.checked
    this.setState({
      config: h
    })
    this.props.updateHook(h)
  }

  minMax () {
    return (
      <div className='row'>
        <div className='col-lg-1' key='tc_notify_min'>Min</div>
        <div className='col-lg-2'>
          <input type='text'
            id='tc_notify_min'
            value={this.state.config.min}
            onChange={this.update('min')}
            disabled={this.props.readOnly}
            className='form-control'
          />
        </div>
        <div className='col-lg-1' />
        <div className='col-lg-1' key='tc_notify_max'>Max</div>
        <div className='col-lg-2'>
          <input
            type='text'
            id='tc_notify_max'
            value={this.state.config.max}
            onChange={this.update('max')}
            disabled={this.props.readOnly}
            className='form-control'
          />
        </div>
      </div>
    )
  }

  update (k) {
    return (function (ev) {
      var h = this.state.config
      h[k] = parseFloat(ev.target.value)
      this.setState({
        config: h
      })
      this.props.updateHook(h)
    }.bind(this))
  }

  render () {
    var minmaxUi = <span className='col-lg-6' />
    if (this.state.config.enable) {
      minmaxUi = this.minMax()
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-lg-3'>
            <input
              type='checkbox'
              id='tc_notify_enable'
              defaultChecked={this.state.config.enable}
              onClick={this.updateEnable}
              disabled={this.props.readOnly}
            />
            <span >Enable alerting</span>
          </div>
          {minmaxUi}
        </div>
        <div className='row' />
      </div>
    )
  }
}
