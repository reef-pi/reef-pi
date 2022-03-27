import React from 'react'
import i18n from 'utils/i18n'

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
    this.handleUpdateEnable = this.handleUpdateEnable.bind(this)
  }

  handleUpdateEnable (ev) {
    const h = this.state.notify
    h.enable = ev.target.checked
    this.setState({ notify: h })
    this.props.update(h)
  }

  update (key) {
    return function (ev) {
      const h = this.state.notify
      h[key] = Number(ev.target.value)
      this.setState({ notify: h })
      this.props.update(h)
    }.bind(this)
  }

  render () {
    const ct = [
      <div className='col-12' key='health_notify_enable'>
        <div className='form-check'>
          <label className='form-check-label'>
            <input
              className='form-check-input'
              type='checkbox'
              id='health_notify_enable'
              defaultChecked={this.state.notify.enable}
              onClick={this.handleUpdateEnable}
            />
            <b>{i18n.t('configuration:settings:alert_health_check')}</b>
          </label>
        </div>
      </div>
    ]
    if (this.state.notify.enable) {
      ct.push(
        <div className='form-group col-md-6 col-12' key='health_notify_max_memory'>
          <label htmlFor='health_max_memory'>{i18n.t('configuration:settings:max_memory')}</label>
          <input
            type='number'
            className='form-control'
            id='health_max_memory'
            value={this.state.notify.max_memory}
            onChange={this.update('max_memory')}
          />
        </div>
      )
      ct.push(
        <div className='form-group col-md-6 col-12' key='health_notify_max_cpu'>
          <label htmlFor='health_max_cpu'>{i18n.t('configuration:settings:max_cpu')}</label>
          <input
            type='number'
            className='form-control'
            id='health_max_cpu'
            value={this.state.notify.max_cpu}
            onChange={this.update('max_cpu')}
          />
        </div>
      )
    }
    return ct
  }
}
