import React from 'react'
import $ from 'jquery'
import ReactDOM from 'react-dom'
import Confirm from './confirm.jsx'
import Auth from './auth.jsx'

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
  }

  ajaxBeforeSend (xhr) {
    var creds = Auth.getCreds()
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
      Auth.removeCreds()
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
