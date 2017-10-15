import React from 'react'
import $ from 'jquery'
import ReactDOM from 'react-dom'
import Confirm from './confirm.jsx'

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
    this.username = this.username.bind(this)
    this.password = this.password.bind(this)
  }

  username () {
    return ('user')
  }

  password () {
    return ('pass')
  }

  ajaxDelete (params) {
    $.ajax({
      url: params.url,
      type: 'DELETE',
      success: params.success.bind(this),
      error: params.error.bind(this),
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(this.username() + ':' + this.password()))
      }.bind(this)
    })
  }

  ajaxPut (params) {
    $.ajax({
      url: params.url,
      type: 'PUT',
      data: params.data,
      success: params.success.bind(this),
      error: params.error.bind(this),
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(this.username() + ':' + this.password()))
      }.bind(this)
    })
  }

  ajaxPost (params) {
    $.ajax({
      url: params.url,
      type: 'POST',
      data: params.data,
      success: params.success.bind(this),
      error: params.error.bind(this),
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(this.username() + ':' + this.password()))
      }.bind(this)
    })
  }

  ajaxGet (params) {
    $.ajax({
      url: params.url,
      type: 'GET',
      dataType: 'json',
      success: params.success.bind(this),
      error: params.error.bind(this),
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(this.username() + ':' + this.password()))
      }.bind(this)
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
