import React from 'react'
import Common from './common.jsx'

export default class Camera extends Common {
  constructor (props) {
    super(props)
    this.state = {
      camera: {},
      latest: {},
      updated: false
    }
    this.fetchData = this.fetchData.bind(this)
    this.update = this.update.bind(this)
    this.capture = this.capture.bind(this)

    this.updateEnable = this.updateEnable.bind(this)
    this.updateUpload = this.updateUpload.bind(this)
    this.updateImageDirectory = this.updateImageDirectory.bind(this)
    this.updateCaptureFlags = this.updateCaptureFlags.bind(this)
    this.updateTickInterval = this.updateTickInterval.bind(this)
    this.showCapture = this.showCapture.bind(this)
    this.showEnable = this.showEnable.bind(this)
  }

  showEnable () {
    if (!this.state.camera.enable) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'>Tick Interval (in minutes)</div>
          <div className='col-sm-1'>
            <input type='text' onChange={this.updateTickInterval} id='tick_interval' value={this.state.camera.tick_interval} />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3'>Capture flags</div>
          <div className='col-sm-3'>
            <input type='text' onChange={this.updateCaptureFlags} id='capture_flags' value={this.state.camera.capture_flags} />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3'>Image Directory</div>
          <div className='col-sm-6'>
            <input type='text' onChange={this.updateImageDirectory} id='image_directory' value={this.state.camera.image_directory} />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3'>Upload to gDrive</div>
          <input type='checkbox' id='camera_gdrive' className='col-sm-2' defaultChecked={this.state.camera.upload} onClick={this.updateUpload} />
        </div>
        <div className='row'>
          <input type='button' id='captureImage' onClick={this.capture} value='Take Photo' className='btn btn-outline-primary' />
        </div>
      </div>
    )
  }

  showCapture () {
    if (this.state.latest.image === undefined) {
      return
    }
    var imgStyle = {
      width: '100%',
      height: '100%',
      borderRadius: '25px'
    }
    return (
      <div className='row'>
        <div className='container'>
          <img src={'/images/' + this.state.latest.image} style={imgStyle} />
        </div>
      </div>
    )
  }

  updateEnable (ev) {
    var camera = this.state.camera
    camera.enable = ev.target.checked
    this.setState({
      camera: camera,
      showAlert: false,
      updated: true
    })
  }

  updateUpload (ev) {
    var camera = this.state.camera
    camera.upload = ev.target.checked
    this.setState({
      camera: camera,
      showAlert: false,
      updated: true
    })
  }

  updateImageDirectory (ev) {
    var camera = this.state.camera
    camera.image_directory = ev.target.value
    this.setState({
      camera: camera,
      showAlert: false,
      updated: true
    })
  }

  updateCaptureFlags (ev) {
    var camera = this.state.camera
    camera.capture_flags = ev.target.value
    this.setState({
      camera: camera,
      showAlert: false,
      updated: true
    })
  }

  updateTickInterval (ev) {
    var camera = this.state.camera
    camera.tick_interval = ev.target.value
    this.setState({
      camera: camera,
      showAlert: false,
      updated: true
    })
  }

  fetchData () {
    this.ajaxGet({
      url: '/api/camera/config',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          camera: data,
          showAlert: false
        })
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({
          showAlert: true,
          alertMsg: xhr.responseText
        })
      }.bind(this)
    })

    if (!this.state.camera.enable) {
      return
    }

    this.ajaxGer({
      url: '/api/camera/latest',
      success: function (data) {
        this.setState({
          latest: data,
          showAlert: false
        })
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({
          showAlert: true,
          alertMsg: xhr.responseText
        })
      }.bind(this)
    })
  }

  update (ev) {
    var camera = this.state.camera
    camera.tick_interval = parseInt(camera.tick_interval)
    if (isNaN(camera.tick_interval)) {
      this.setStat({
        showAlert: true,
        alertMsg: 'Tick interval has to be a positive integer'
      })
      return
    }
    this.ajaxPost({
      url: '/api/camera/config',
      data: JSON.stringify(camera),
      success: function (data) {
        this.fetchData()
        this.setState({updated: false})
      }.bind(this),
      error: function (xhr, status, err) {
        this.setStat({
          showAlert: true,
          alertMsg: xhr.responseText
        })
      }.bind(this)
    })
  }

  capture () {
    this.ajaxPost({
      url: '/api/camera/shoot',
      data: JSON.stringify({}),
      success: function (data) {
        this.setState({
          latest: data,
          showAlert: false
        })
      }.bind(this),
      error: function (xhr, status, err) {
        this.setStat({
          showAlert: true,
          alertMsg: xhr.responseText
        })
      }.bind(this),
      timeout: 30000
    })
  }

  componentDidMount () {
    this.fetchData()
  }

  render () {
    var updateButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-sm-2'
    }
    return (
      <div className='container'>
        {super.render()}
        <div className='row'>
          <div className='col-sm-2'>Enable</div>
          <input type='checkbox' id='camera_enable' className='col-sm-2' defaultChecked={this.state.camera.enable} onClick={this.updateEnable} />
        </div>
        {this.showEnable() }
        <div className='row'>
          <input type='button' id='updateCamera' onClick={this.update} value='update' className={updateButtonClass} />
        </div>
        {this.showCapture()}
      </div>
    )
  }
}
