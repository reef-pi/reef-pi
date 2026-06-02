import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import fs from 'fs'
import path from 'path'
import { Dialog, Menu, Tabs, Tooltip } from './Interaction'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function render (component) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(component))
  return { container, root, cleanup: () => act(() => { root.unmount(); container.remove() }) }
}

describe('design-system interaction primitives', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders Dialog as a labelled modal and closes on Escape and backdrop click', () => {
    const onClose = jest.fn()
    render(<Dialog open title='Delete equipment' onClose={onClose} actions={<button>Confirm</button>}>This action will delete equipment Skimmer.</Dialog>)

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy()

    act(() => dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(onClose).toHaveBeenCalledTimes(1)

    act(() => document.querySelector('.reefpi-dialog-backdrop').dispatchEvent(new MouseEvent('mousedown', { bubbles: true })))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('cycles Dialog focus inside the modal', () => {
    render(<Dialog open title='Focus test'><button>First</button><button>Second</button></Dialog>)
    const dialog = document.querySelector('[role="dialog"]')
    const buttons = document.querySelectorAll('button')

    buttons[1].focus()
    act(() => dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })))
    expect(document.activeElement).toBe(buttons[0])
  })

  it('opens Menu, moves with arrow keys, closes on outside click, and runs item actions', () => {
    const select = jest.fn()
    render(<Menu buttonLabel='More' items={[{ label: 'Edit', onSelect: select }, { label: 'Delete' }]} />)

    act(() => document.querySelector('button').click())
    expect(document.querySelector('[role="menu"]')).toBeTruthy()

    const items = document.querySelectorAll('[role="menuitem"]')
    items[0].focus()
    act(() => document.querySelector('[role="menu"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })))
    expect(document.activeElement).toBe(items[1])

    act(() => items[0].click())
    expect(select).toHaveBeenCalled()

    act(() => document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })))
    expect(document.querySelector('[role="menu"]')).toBeNull()
  })

  it('shows Tooltip on focus and hover with described-by wiring', () => {
    render(<Tooltip text='Retry command'><button>Retry</button></Tooltip>)
    const button = document.querySelector('button')

    act(() => button.focus())
    const tooltip = document.querySelector('[role="tooltip"]')
    expect(tooltip.textContent).toBe('Retry command')
    expect(button.getAttribute('aria-describedby')).toBe(tooltip.id)

    act(() => button.blur())
    expect(document.querySelector('[role="tooltip"]')).toBeNull()
  })

  it('renders keyboardable Tabs and calls onChange when stepping tabs', () => {
    const onChange = jest.fn()
    const { container } = render(<Tabs onChange={onChange} tabs={[
      { id: 'settings', label: 'Settings', panel: 'Settings panel' },
      { id: 'connectors', label: 'Connectors', panel: 'Connectors panel' }
    ]} />)

    const tablist = container.querySelector('[role="tablist"]')
    expect(container.querySelector('[role="tabpanel"]').textContent).toBe('Settings panel')

    act(() => tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })))
    expect(onChange).toHaveBeenCalledWith('connectors')
    expect(container.querySelector('[role="tabpanel"]').textContent).toBe('Connectors panel')
  })

  it('documents the preview story without Bootstrap JS or jQuery hooks', () => {
    const story = fs.readFileSync(path.join(process.cwd(), 'front-end/design-system/preview/primitives/interactions.html'), 'utf8')

    expect(story).toContain('role="dialog"')
    expect(story).toContain('role="menu"')
    expect(story).toContain('role="tooltip"')
    expect(story).toContain('role="tablist"')
    expect(story).not.toContain('data-toggle')
    expect(story).not.toContain('jquery')
    expect(story).not.toContain('bootstrap')
  })
})
