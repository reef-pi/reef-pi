import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'
import Confirm from './confirm.jsx'

export default class Admin extends React.Component {
  constructor (props) {
    super(props)
    this.powerOff = this.powerOff.bind(this)
    this.reboot = this.reboot.bind(this)
    this.reload = this.reload.bind(this)
    this.confirm = this.confirm.bind(this)
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

  reload () {
    this.confirm('Are you sure ?')
    .then(function () {
      $.ajax({
        url: '/api/admin/reload',
        type: 'POST',
        success: function (data) {
        },
        error: function (xhr, status, err) {
          console.log(err.toString())
        }
      })
    })
  }
  powerOff () {
    this.confirm('Are you sure ?')
    .then(function () {
      $.ajax({
        url: '/api/admin/poweroff',
        type: 'POST',
        success: function (data) {
        },
        error: function (xhr, status, err) {
          console.log(err.toString())
        }
      })
    })
  }

  reboot () {
    this.confirm('Are you sure ?')
    .then(function () {
      $.ajax({
        url: '/api/admin/reboot',
        type: 'POST',
        success: function (data) {
        },
        error: function (xhr, status, err) {
          console.log(err.toString())
        }
      })
    })
  }

  render () {
    return (
      <div className='container'>
        <input value='Reload' onClick={this.reload} type='button' className='btn btn-outline-danger' />
        <input value='Reboot' onClick={this.reboot} type='button' className='btn btn-outline-danger' />
        <input value='Poweroff' onClick={this.powerOff} type='button' className='btn btn-outline-danger' />
      </div>
    )
  }
}
