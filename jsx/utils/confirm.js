import Confirm from '../confirm.jsx'
import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

export function  confirm (message, options) {
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
