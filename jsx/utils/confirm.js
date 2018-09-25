import Confirm from 'confirm'
import React from 'react'
import ReactDOM from 'react-dom'

export function confirm (message, options = {}) {
  let cleanup, component, props, wrapper
  props = Object.assign({ message: message }, options)
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
