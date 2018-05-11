import React from 'react'
import PropTypes from 'prop-types'
import $ from 'jquery'
import {ajaxGet, ajaxPost} from '../utils/ajax.js'
import {showAlert, hideAlert} from '../utils/alert.js'


export default class Config extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: this.props.config,
      updated: true
    }

    this.updateText = this.updateText.bind(this)
    this.updateBool = this.updateBool.bind(this)
    this.save = this.save.bind(this)
  }

  save (ev) {
    var config = this.state.config
    config.tick_interval = parseInt(config.tick_interval)
    if (isNaN(config.tick_interval)) {
      showAlert('Tick interval has to be a positive integer')
      return
    }
    ajaxPost({
      url: '/api/camera/config',
      data: JSON.stringify(config),
      success: function (data) {
        this.setState({updated: false})
        hideAlert()
      }.bind(this)
    })
  }

  updateBool (k) {
    return(function(ev) {
      var config = this.state.config
      config[k] = ev.target.checked
      this.setState({
        config: config,
        updated: true
      })
      hideAlert()
   }.bind(this))
  }

  updateText(k) {
    return(function(ev){
      var config = this.state.config
      config[k] = ev.target.value
      this.setState({
        config: config,
        updated: true
      })
      hideAlert()
    }.bind(this)
    )
  }

  render() {
    if(this.state.config.enable === undefined){
      return(
        <div className='container'>
          Loading...
        </div>
      )
    }
    var saveButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      saveButtonClass = 'btn btn-outline-danger col-sm-2'
    }
    return(
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>Enable</div>
          <input type='checkbox' id='camera_enable' className='col-sm-2' defaultChecked={this.state.config.enable} onClick={this.updateBool('enable')} />
        </div>
        <div className='row'>
          <div className='col-sm-3'>Tick Interval (in minutes)</div>
          <div className='col-sm-1'>
            <input type='text' onChange={this.updateText('tick_interval')} id='tick_interval' value={this.state.config.tick_interval} />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3'>Capture flags</div>
          <div className='col-sm-3'>
            <input type='text' onChange={this.updateText('capture_flags')} id='capture_flags' value={this.state.config.capture_flags} />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3'>Image Directory</div>
          <div className='col-sm-6'>
            <input type='text' onChange={this.updateText('image_directory')} id='image_directory' value={this.state.config.image_directory} />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3'>Upload to gDrive</div>
          <input type='checkbox' id='camera_gdrive' className='col-sm-2' defaultChecked={this.state.config.upload} onClick={this.updateBool('upload')} />
        </div>
        <div className='row'>
          <input type='button' id='updateCamera' onClick={this.save} value='update' className={saveButtonClass} />
        </div>
      </div>
    )
  }
}

