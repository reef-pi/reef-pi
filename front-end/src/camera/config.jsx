import React from 'react'
import { showError } from 'utils/alert'
import i18next from 'i18next'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

export default class Config extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: this.props.config,
      updated: true
    }

    this.updateText = this.updateText.bind(this)
    this.updateBool = this.updateBool.bind(this)
    this.handleSave = this.handleSave.bind(this)
  }

  handleSave (ev) {
    const config = { ...this.state.config }
    config.tick_interval = parseInt(config.tick_interval)
    if (isNaN(config.tick_interval)) {
      showError(i18next.t('camera:tick_must_be_positive'))
      return
    }
    this.props.update(config)
    this.setState({ updated: false })
  }

  updateBool (k) {
    return (function (ev) {
      const config = {
        ...this.state.config,
        [k]: ev.target.checked
      }
      this.setState({
        config,
        updated: true
      })
    }.bind(this))
  }

  updateText (k) {
    return (function (ev) {
      const config = {
        ...this.state.config,
        [k]: ev.target.value
      }
      this.setState({
        config,
        updated: true
      })
    }.bind(this)
    )
  }

  render () {
    if (this.state.config.enable === undefined) {
      return (
        <div>
          {i18next.t('loading')}
        </div>
      )
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
        <FormField label={i18next.t('camera:enable')}>
          <input type='checkbox' id='camera_enable' defaultChecked={this.state.config.enable} onClick={this.updateBool('enable')} />
        </FormField>
        <FormField label={i18next.t('camera:tick_interval')}>
          <Input type='text' onChange={this.updateText('tick_interval')} id='tick_interval' value={this.state.config.tick_interval} />
        </FormField>
        <FormField label={i18next.t('camera:capture_flags')}>
          <Input type='text' onChange={this.updateText('capture_flags')} id='capture_flags' value={this.state.config.capture_flags} />
        </FormField>
        <FormField label={i18next.t('camera:target_dir')}>
          <Input type='text' onChange={this.updateText('image_directory')} id='image_directory' value={this.state.config.image_directory} />
        </FormField>
        <FormField label={i18next.t('camera:to_gdrive')}>
          <input type='checkbox' id='camera_gdrive' defaultChecked={this.state.config.upload} onClick={this.updateBool('upload')} />
        </FormField>
        <div>
          <Button
            data-testid='camera-save-btn'
            id='updateCamera'
            onClick={this.handleSave}
            variant={this.state.updated ? 'primary' : 'secondary'}
          >
            {i18next.t('update')}
          </Button>
        </div>
      </div>
    )
  }
}
