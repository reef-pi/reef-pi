import React from 'react'
import Modal from 'modal'
import i18next from 'i18next'
import Button from '../design-system/ui_kits/reef-pi-app/primitives/Button'

export default class Confirm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      confirmLabel: props.confirmLabel === undefined ? i18next.t('ok') : props.confirmLabel,
      abortLabel: props.abortLabel === undefined ? i18next.t('cancel') : props.abortLabel
    }
    this.confirmRef = React.createRef()
    this.handleAbort = this.handleAbort.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
  }

  handleAbort () {
    return this._reject && this._reject()
  }

  handleConfirm () {
    return this._resolve && this._resolve()
  }

  componentDidMount () {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
    if (this.confirmRef.current) {
      this.confirmRef.current.focus()
    }
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
            <Button role='abort' variant='secondary' onClick={this.handleAbort}>
              {this.state.abortLabel}
            </Button>
            {' '}
            <Button role='confirm' ref={this.confirmRef} onClick={this.handleConfirm}>
              {this.state.confirmLabel}
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}
