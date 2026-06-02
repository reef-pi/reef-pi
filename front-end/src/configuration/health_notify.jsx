import React from 'react'
import i18n from 'utils/i18n'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

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
      <div key='health_notify_enable' style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
        <input
          type='checkbox'
          id='health_notify_enable'
          defaultChecked={this.state.notify.enable}
          onClick={this.handleUpdateEnable}
        />
        <label htmlFor='health_notify_enable'>
          <b>{i18n.t('configuration:settings:alert_health_check')}</b>
        </label>
      </div>
    ]
    if (this.state.notify.enable) {
      ct.push(
        <FormField key='health_notify_max_memory' label={i18n.t('configuration:settings:max_memory')}>
          <Input
            type='number'
            id='health_max_memory'
            value={this.state.notify.max_memory}
            onChange={this.update('max_memory')}
          />
        </FormField>
      )
      ct.push(
        <FormField key='health_notify_max_cpu' label={i18n.t('configuration:settings:max_cpu')}>
          <Input
            type='number'
            id='health_max_cpu'
            value={this.state.notify.max_cpu}
            onChange={this.update('max_cpu')}
          />
        </FormField>
      )
      ct.push(
        <FormField key='health_notify_max_cpu_temp' label={i18n.t('configuration:settings:max_cpu_temp')}>
          <Input
            type='number'
            id='health_max_cpu_temp'
            value={this.state.notify.max_cpu_temp}
            onChange={this.update('max_cpu_temp')}
          />
        </FormField>
      )
    }
    ct.push(
      <div key='health_report_enable' style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
        <input
          type='checkbox'
          id='health_report_enable'
          defaultChecked={this.state.notify.report_enable}
          onClick={this.handleUpdateReportEnable}
        />
        <label htmlFor='health_report_enable'>
          <b>{i18n.t('configuration:settings:report_enable')}</b>
        </label>
      </div>
    )
    if (this.state.notify.report_enable) {
      ct.push(
        <FormField
          key='health_report_schedule'
          label={i18n.t('configuration:settings:report_schedule')}
          helpText={i18n.t('configuration:settings:report_schedule_help')}
        >
          <Input
            type='text'
            id='health_report_schedule'
            placeholder='0 8 * * *'
            value={this.state.notify.report_schedule}
            onChange={this.update('report_schedule')}
          />
        </FormField>
      )
    }
    return <>{ct}</>
  }
}
