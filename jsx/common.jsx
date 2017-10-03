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
