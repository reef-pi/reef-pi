import React from 'react'
import { showError } from 'utils/alert'
import i18next from 'i18next'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

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
        <div className='container'>
          {i18next.t('loading')}
        </div>
      )
    }
    return (
      <div className='container'>
        <div className='row'>
          <div>{i18next.t('camera:enable')}</div>
          <input type='checkbox' id='camera_enable' defaultChecked={this.state.config.enable} onClick={this.updateBool('enable')} />
        </div>
        <div className='row'>
          <div>{i18next.t('camera:tick_interval')}</div>
          <div>
            <input type='text' onChange={this.updateText('tick_interval')} id='tick_interval' value={this.state.config.tick_interval} />
          </div>
        </div>
        <div className='row'>
          <div>{i18next.t('camera:capture_flags')}</div>
          <div>
            <input type='text' onChange={this.updateText('capture_flags')} id='capture_flags' value={this.state.config.capture_flags} />
          </div>
        </div>
        <div className='row'>
          <div>{i18next.t('camera:target_dir')}</div>
          <div>
            <input type='text' onChange={this.updateText('image_directory')} id='image_directory' value={this.state.config.image_directory} />
          </div>
        </div>
        <div className='row'>
          <div>{i18next.t('camera:to_gdrive')}</div>
          <input type='checkbox' id='camera_gdrive' defaultChecked={this.state.config.upload} onClick={this.updateBool('upload')} />
        </div>
        <div className='row'>
          <Button
            data-testid='camera-save-btn'
            id='updateCamera'
            onClick={this.handleSave}
            variant={this.state.updated ? 'danger' : 'primary'}
          >
            {i18next.t('update')}
          </Button>
        </div>
      </div>
    )
  }
}
