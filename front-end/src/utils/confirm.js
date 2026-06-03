import Confirm from 'confirm'
import React from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

export function confirm (message, options = {}) {
  const props = { message, ...options }
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

  // Use native Promise: call cleanup in both then and catch branches
  return modalRef.current.promise.then(
    function (result) { cleanup(); return result },
    function (reason) { cleanup(); return Promise.reject(reason) }
  )
}
