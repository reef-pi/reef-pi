import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import Confirm from './confirm'
import 'utils/i18n'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function render (props) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  const ref = React.createRef()
  act(() => root.render(<Confirm ref={ref} {...props} />))
  return { ref, cleanup: () => { act(() => root.unmount()); container.remove() } }
}

const dialog = () => document.querySelector('.reefpi-dialog')

describe('<Confirm /> on the Dialog primitive (#3314)', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('is a labelled dialog titled by the message, with the description as its body', () => {
    const view = render({ message: 'Delete item?', description: <span id='description'>This cannot be undone.</span> })
    const node = dialog()
    expect(node.getAttribute('role')).toBe('dialog')
    expect(node.getAttribute('aria-modal')).toBe('true')
    expect(document.getElementById(node.getAttribute('aria-labelledby')).textContent).toBe('Delete item?')
    expect(node.querySelector('#description').textContent).toBe('This cannot be undone.')
    expect(node.closest('.modal')).toBeNull()
    view.cleanup()
  })

  it('has default OK/Cancel labels and honours custom ones', () => {
    let view = render({ message: 'Continue?' })
    expect(dialog().querySelector('button[role="confirm"]').textContent).toBe('ok')
    expect(dialog().querySelector('button[role="abort"]').textContent).toBe('cancel')
    view.cleanup()
    view = render({ message: 'Continue?', confirmLabel: 'Yes', abortLabel: 'No' })
    expect(dialog().querySelector('button[role="confirm"]').textContent).toBe('Yes')
    expect(dialog().querySelector('button[role="abort"]').textContent).toBe('No')
    view.cleanup()
  })

  it('makes the confirm action primary and focuses it on open', () => {
    const view = render({ message: 'Continue?' })
    const confirm = dialog().querySelector('button[role="confirm"]')
    expect(confirm.className).toContain('reefpi-button--primary')
    expect(dialog().querySelector('button[role="abort"]').className).toContain('reefpi-button--secondary')
    expect(document.activeElement).toBe(confirm)
    view.cleanup()
  })

  it('resolves on confirm', async () => {
    const view = render({ message: 'Continue?' })
    const result = view.ref.current.promise.then(() => 'resolved', () => 'rejected')
    act(() => dialog().querySelector('button[role="confirm"]').click())
    await expect(result).resolves.toBe('resolved')
    view.cleanup()
  })

  it('rejects on Cancel, Escape and a backdrop click', async () => {
    for (const dismiss of [
      () => dialog().querySelector('button[role="abort"]').click(),
      () => dialog().dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
      () => document.querySelector('.reefpi-dialog-backdrop').dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }))
    ]) {
      const view = render({ message: 'Continue?' })
      const result = view.ref.current.promise.then(() => 'resolved', () => 'rejected')
      act(dismiss)
      await expect(result).resolves.toBe('rejected')
      view.cleanup()
    }
  })

  it('settles only once', async () => {
    const view = render({ message: 'Continue?' })
    const result = view.ref.current.promise.then(() => 'resolved', () => 'rejected')
    act(() => {
      dialog().querySelector('button[role="confirm"]').click()
      dialog().querySelector('button[role="abort"]').click()
    })
    await expect(result).resolves.toBe('resolved')
    view.cleanup()
  })
})
