import React from 'react'
import PropTypes from 'prop-types'
import $ from 'jquery'
import {ajaxGet, ajaxPost} from '../utils/ajax.js'


export default class Capture extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      latest: {}
    }
    this.fetch = this.fetch.bind(this)
    this.capture = this.capture.bind(this)
  }

  fetch() {
    ajaxGet({
      url: '/api/camera/latest',
      success: function (data) {
        this.setState({
          latest: data,
          showAlert: false
        })
      }.bind(this)
    })
  }

  capture () {
    ajaxPost({
      url: '/api/camera/shoot',
      data: JSON.stringify({}),
      success: function (data) {
        this.setState({
          latest: data,
          showAlert: false
        })
      }.bind(this),
      timeout: 30000
    })
  }
  render() {
    var img = <div className='container'></div>
    if (this.state.latest.image !== undefined) {
       img =  <img src={'/images/' + this.state.latest.image} style={imgStyle} />
    }
    var imgStyle = {
      width: '100%',
      height: '100%',
      borderRadius: '25px'
    }
    return (
      <div className='container'>
        <div className='row'>
          <input type='button' id='captureImage' onClick={this.capture} value='Take Photo' className='btn btn-outline-primary' />
        </div>
        <div className='row'>
          {img}
        </div>
      </div>
    )
  }
}
