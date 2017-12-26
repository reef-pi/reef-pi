import React from 'react'
import $ from 'jquery'
import ReactDOM from 'react-dom'
import Confirm from './confirm.jsx'
import SignIn from './sign_in.jsx'

export default class Common extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showAlert: false,
      alertMsg: ''
    }
    this.showAlert = this.showAlert.bind(this)
    this.ajaxGet = this.ajaxGet.bind(this)
    this.ajaxPost = this.ajaxPost.bind(this)
    this.ajaxPut = this.ajaxPut.bind(this)
    this.ajaxDelete = this.ajaxDelete.bind(this)
    this.ajaxErrorHandler = this.ajaxErrorHandler.bind(this)
    this.ajaxBeforeSend = this.ajaxBeforeSend.bind(this)
    this.toggle = this.toggle.bind(this)
    this.chartWidth = this.chartWidth.bind()
    this.chartHeight = this.chartHeight.bind(this)
  }

  chartWidth () {
    var w = $(window).width()
    if (w >= 2048) {
      return 800
    }
    if (w >= 1024) {
      return 500
    }
    if (w >= 800) {
      return 350
    }
    return 200
  }

  chartHeight () {
    var w = $(window).height()
    if (w >= 1024) {
      return 250
    }
    if (w >= 400) {
      return 150
    }
    return 70
  }

  toggle (id) {
    var el = $(id)
    if (el.css('display') === 'block') {
      el.css('display', 'none')
    } else {
      el.css('display', 'block')
    }
  }

  ajaxBeforeSend (xhr) {
    var creds = SignIn.getCreds()
    var authHeader = 'Basic ' + window.btoa(creds.user + ':' + creds.password)
    xhr.setRequestHeader('Authorization', authHeader)
  }

  ajaxErrorHandler (xhr, status, err) {
    this.setState({
      showAlert: true,
      alertMsg: xhr.responseText
    })
    // If authentication error, reset creds and reload page
    if (xhr.status === 401) {
      SignIn.removeCreds()
    }
  }

  ajaxDelete (params) {
    $.ajax({
      url: params.url,
      type: 'DELETE',
      success: params.success.bind(this),
      error: this.ajaxErrorHandler,
      beforeSend: this.ajaxBeforeSend
    })
  }

  ajaxPut (params) {
    $.ajax({
      url: params.url,
      type: 'PUT',
      data: params.data,
      success: params.success.bind(this),
      error: this.ajaxErrorHandler,
      beforeSend: this.ajaxBeforeSend
    })
  }

  ajaxPost (params) {
    $.ajax({
      url: params.url,
      type: 'POST',
      data: params.data,
      success: params.success.bind(this),
      error: this.ajaxErrorHandler,
      beforeSend: this.ajaxBeforeSend
    })
  }

  ajaxGet (params) {
    $.ajax({
      url: params.url,
      type: 'GET',
      dataType: 'json',
      success: params.success.bind(this),
      error: this.ajaxErrorHandler,
      beforeSend: this.ajaxBeforeSend
    })
  }

  showAlert () {
    if (!this.state.showAlert) {
      return
    }
    return (
      <div className='alert alert-danger'>
        {this.state.alertMsg}
      </div>
    )
  }

  confirm (message, options) {
    var cleanup, component, props, wrapper
    if (options == null) {
      options = {}
    }
    props = $.extend({
      message: message
    }, options)
    wrapper = document.body.appendChild(document.createElement('div'))
    component = ReactDOM.render(<Confirm {...props} />, wrapper)
    cleanup = function () {
      ReactDOM.unmountComponentAtNode(wrapper)
      return setTimeout(function () {
        return wrapper.remove()
      })
    }
    return component.promise.always(cleanup).promise()
  }

  render () {
    return (
      <div className='container'>
        {this.showAlert()}
      </div>
    )
  }
}
