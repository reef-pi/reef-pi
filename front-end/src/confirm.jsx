import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'
import Modal from 'modal'
import i18next from 'i18next'
export default class Confirm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      confirmLabel: props.confirmLabel === undefined ? i18next.t('ok') : props.confirmLabel,
      abortLabel: props.abortLabel === undefined ? i18next.t('cancel') : props.abortLabel
    }
    this.handleAbort = this.handleAbort.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
  }

  handleAbort () {
    return this.promise.reject()
  }

  handleConfirm () {
    return this.promise.resolve()
  }

  componentDidMount () {
    this.promise = new $.Deferred()
    return ReactDOM.findDOMNode(this.refs.confirm).focus()
  }

  render () {
    let modalBody
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
            <button role='abort' type='button' className='btn btn-light' onClick={this.handleAbort}>
              {this.state.abortLabel}
            </button>
            {' '}
            <button role='confirm' type='button' className='btn btn-primary' ref='confirm' onClick={this.handleConfirm}>
              {this.state.confirmLabel}
            </button>
          </div>
        </div>
      </Modal>
    )
  }
}
