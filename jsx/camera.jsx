import React from 'react'
import $ from 'jquery'

export default class Camera extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      camera: {}
    }
    this.fetchData = this.fetchData.bind(this)
    this.update = this.update.bind(this)

    this.updateEnable = this.updateEnable.bind(this)
    this.updateImageDirectory = this.updateImageDirectory.bind(this)
    this.updateCaptureFlags = this.updateCaptureFlags.bind(this)
    this.updateTickInterval = this.updateTickInterval.bind(this)
  }

  updateEnable (ev) {
    var camera = this.state.camera
    camera.enable = ev.target.checked
    this.setState({
      camera: camera
    })
  }

  updateImageDirectory (ev) {
    var camera = this.state.camera
    camera.image_directory = ev.target.value
    this.setState({
      camera: camera
    })
  }

  updateCaptureFlags (ev) {
    var camera = this.state.camera
    camera.capture_flags = ev.target.value
    this.setState({
      camera: camera
    })
  }

  updateTickInterval (ev) {
    var camera = this.state.camera
    camera.tick_interval = ev.target.value
    this.setState({
      camera: camera
    })
  }

  fetchData () {
    $.ajax({
      url: '/api/camera',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          camera: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  update (ev) {
    var camera = this.state.camera
    camera.tick_interval = parseInt(camera.tick_interval)
    if (isNaN(camera.tick_interval)) {
      window.alert('Capture interval  has to be a positive integer')
      return
    }
    $.ajax({
      url: '/api/camera',
      type: 'POST',
      data: JSON.stringify(camera),
      success: function (data) {
        this.fetchData()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  componentDidMount () {
    this.fetchData()
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>Enable</div>
          <input type='checkbox' id='camera_enable' className='col-sm-2' defaultChecked={this.state.camera.enable} onClick={this.updateEnable} />
        </div>
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
          <input type='button' id='updateCamera' onClick={this.update} value='update' className='btn btn-outline-primary' />
        </div>
      </div>
    )
  }
}
