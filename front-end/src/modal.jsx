import React from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default class Modal extends React.Component {
  constructor (props) {
    super(props)
    this.modal = this.modal.bind(this)
    this.backdrop = this.backdrop.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.ref = React.createRef()
  }

  handleKeyDown (e) {
    if (e.key === 'Escape' && this.props.onEscape) {
      e.stopPropagation()
      this.props.onEscape()
      return
    }
    if (e.key !== 'Tab' || !this.ref.current) {
      return
    }
    const items = Array.from(this.ref.current.querySelectorAll(FOCUSABLE))
    if (items.length === 0) {
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  backdrop () {
    return <div className='modal-backdrop show' />
  }

  modal () {
    return (
      <div
        className='modal in'
        ref={this.ref}
        tabIndex='-1'
        role='dialog'
        aria-modal='true'
        aria-labelledby={this.props.labelledBy}
        onKeyDown={this.handleKeyDown}
      >
        <div className='modal-dialog'>
          <div className='modal-content'>
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }

  render () {
    return (
      <div>
        {this.backdrop()}
        {this.modal()}
      </div>
    )
  }
}
