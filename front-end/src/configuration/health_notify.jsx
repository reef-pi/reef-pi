import React from 'react'
import i18n from 'utils/i18n'

export default class HealthNotify extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      notify: {
        enable: props.state.enable,
        max_memory: props.state.max_memory,
        max_cpu: props.state.max_cpu,
        max_cpu_temp: props.state.max_cpu_temp,
        report_enable: props.state.report_enable,
        report_schedule: props.state.report_schedule || ''
      }
    }
    this.update = this.update.bind(this)
    this.handleUpdateEnable = this.handleUpdateEnable.bind(this)
    this.handleUpdateReportEnable = this.handleUpdateReportEnable.bind(this)
  }

  handleUpdateEnable (ev) {
    const h = { ...this.state.notify }
    h.enable = ev.target.checked
    this.setState({ notify: h })
    this.props.update(h)
  }

  handleUpdateReportEnable (ev) {
    const h = { ...this.state.notify }
    h.report_enable = ev.target.checked
    this.setState({ notify: h })
    this.props.update(h)
  }

  update (key) {
    return function (ev) {
      const h = { ...this.state.notify }
      h[key] = key === 'report_schedule' ? ev.target.value : Number(ev.target.value)
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
      ct.push(
        <div className='form-group col-md-6 col-12' key='health_notify_max_cpu_temp'>
          <label htmlFor='health_max_cpu_temp'>{i18n.t('configuration:settings:max_cpu_temp')}</label>
          <input
            type='number'
            className='form-control'
            id='health_max_cpu_temp'
            value={this.state.notify.max_cpu_temp}
            onChange={this.update('max_cpu_temp')}
          />
        </div>
      )
    }
    ct.push(
      <div className='col-12' key='health_report_enable'>
        <div className='form-check'>
          <label className='form-check-label'>
            <input
              className='form-check-input'
              type='checkbox'
              id='health_report_enable'
              defaultChecked={this.state.notify.report_enable}
              onClick={this.handleUpdateReportEnable}
            />
            <b>{i18n.t('configuration:settings:report_enable')}</b>
          </label>
        </div>
      </div>
    )
    if (this.state.notify.report_enable) {
      ct.push(
        <div className='form-group col-md-8 col-12' key='health_report_schedule'>
          <label htmlFor='health_report_schedule'>{i18n.t('configuration:settings:report_schedule')}</label>
          <input
            type='text'
            className='form-control'
            id='health_report_schedule'
            placeholder='0 8 * * *'
            value={this.state.notify.report_schedule}
            onChange={this.update('report_schedule')}
          />
          <small className='form-text text-muted'>{i18n.t('configuration:settings:report_schedule_help')}</small>
        </div>
      )
    }
    return <>{ct}</>
  }
}
