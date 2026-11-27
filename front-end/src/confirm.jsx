import React from 'react'
import i18next from 'i18next'
import { Dialog } from '../design-system/ui_kits/reef-pi-app/primitives/Interaction'
import Button from '../design-system/ui_kits/reef-pi-app/primitives/Button'

// A yes/no question as a Dialog (#3314). `showModal` (utils/confirm) reads `promise`: it resolves
// when confirmed and rejects when cancelled, dismissed with Escape, or clicked away. It settles once.
export default class Confirm extends React.Component {
  constructor (props) {
    super(props)
    this.confirmRef = React.createRef()
    this.settled = false
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
    this.handleAbort = this.handleAbort.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
  }

  handleAbort () {
    if (this.settled) return undefined
    this.settled = true
    return this._reject()
  }

  handleConfirm () {
    if (this.settled) return undefined
    this.settled = true
    return this._resolve()
  }

  render () {
    const { confirmLabel, abortLabel, message, description } = this.props
    const actions = (
      <>
        <Button role='abort' type='button' variant='secondary' onClick={this.handleAbort}>
          {abortLabel === undefined ? i18next.t('cancel') : abortLabel}
        </Button>
        <Button role='confirm' type='button' variant='primary' ref={this.confirmRef} onClick={this.handleConfirm}>
          {confirmLabel === undefined ? i18next.t('ok') : confirmLabel}
        </Button>
      </>
    )

    return (
      // Focus lands on the confirm action, as before, rather than the first button.
      <Dialog open onClose={this.handleAbort} title={message} initialFocusRef={this.confirmRef} actions={actions}>
        {description}
      </Dialog>
    )
  }
}
