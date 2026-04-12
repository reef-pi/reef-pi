import Confirm from 'confirm'
import React from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

export function confirm (message, options = {}) {
  const props = Object.assign({ message: message }, options)
  return showModal(<Confirm {...props} />)
}

export function showModal (modal) {
  const wrapper = document.body.appendChild(document.createElement('div'))
  const root = createRoot(wrapper)
  const modalRef = React.createRef()

  const cleanup = function () {
    root.unmount()
    return setTimeout(function () {
      return wrapper.remove()
    })
  }

  flushSync(function () {
    root.render(React.cloneElement(modal, { ref: modalRef }))
  })

  return modalRef.current.promise.always(cleanup).promise()
}
