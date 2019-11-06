import Confirm from 'confirm'
import React from 'react'
import ReactDOM from 'react-dom'

export function confirm (message, options = {}) {
  const props = Object.assign({ message: message }, options)
  return showModal(<Confirm {...props} />)
}

export function showModal (modal) {
  const wrapper = document.body.appendChild(document.createElement('div'))

  const cleanup = function () {
    ReactDOM.unmountComponentAtNode(wrapper)
    return setTimeout(function () {
      return wrapper.remove()
    })
  }
  return ReactDOM.render(modal, wrapper).promise.always(cleanup).promise()
}
