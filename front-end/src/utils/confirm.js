import Confirm from 'confirm'
import React from 'react'
import ReactDOM from 'react-dom'

export function confirm (message, options = {}) {
  let props = Object.assign({ message: message }, options)
  return showModal(<Confirm {...props} />)
}

export function showModal (modal) {
  let cleanup, component, wrapper
  wrapper = document.body.appendChild(document.createElement('div'))
  component = ReactDOM.render(modal, wrapper)

  cleanup = function () {
    ReactDOM.unmountComponentAtNode(wrapper)
    return setTimeout(function () {
      return wrapper.remove()
    })
  }
  return component.promise.always(cleanup).promise()
}
