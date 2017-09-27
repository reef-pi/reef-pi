import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'
import Modal from './modal.jsx'

export default class Confirm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      confirmLabel: props.confirmLabel === undefined ? 'OK' : props.confirmLabel,
      abortLabel: props.abortLabel === undefined ? 'Cancel' : props.abortLabel
    }
    this.abort = this.abort.bind(this)
    this.confirm = this.confirm.bind(this)
  }

  abort () {
    return this.promise.reject()
  }

  confirm () {
    return this.promise.resolve()
  }

  componentDidMount () {
    this.promise = new $.Deferred()
    return ReactDOM.findDOMNode(this.refs.confirm).focus()
  }

  render () {
    var modalBody
    if (this.props.description) {
      modalBody = (
        <div className='modal-body'>
          {this.props.description}
        </div>
      )
    }

    return (
      <Modal>
        <div className='modal-header'>
          <h4 className='modal-title'>
            {this.props.message}
          </h4>
        </div>
        {modalBody}
        <div className='modal-footer'>
          <div className='text-right'>
            <button role='abort' type='button' className='btn btn-default' onClick={this.abort}>
              {this.state.abortLabel}
            </button>
            {' '}
            <button role='confirm' type='button' className='btn btn-primary' ref='confirm' onClick={this.confirm}>
              {this.state.confirmLabel}
            </button>
          </div>
        </div>
      </Modal>
    )
  }
}
