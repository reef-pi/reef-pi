import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'

const surfaceStyle = {
  background: 'var(--reefpi-color-surface-elevated)',
  border: '1px solid var(--reefpi-color-border)',
  borderRadius: 'var(--reefpi-radius-md)',
  color: 'var(--reefpi-color-text)',
  fontFamily: 'var(--reefpi-font-app)'
}

const actionButtonStyle = {
  alignItems: 'center',
  background: 'var(--reefpi-color-surface-elevated)',
  border: '1px solid var(--reefpi-color-border)',
  borderRadius: 'var(--reefpi-radius-sm)',
  color: 'var(--reefpi-color-text)',
  cursor: 'pointer',
  display: 'inline-flex',
  fontFamily: 'var(--reefpi-font-app)',
  fontSize: '0.9375rem',
  fontWeight: 600,
  gap: 'var(--reefpi-space-xs)',
  justifyContent: 'center',
  minHeight: 'var(--reefpi-tap-target-min)',
  minWidth: 'var(--reefpi-tap-target-min)',
  padding: '0 var(--reefpi-space-md)'
}

function focusableElements (node) {
  if (!node) return []
  return Array.from(node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.disabled && !el.getAttribute('aria-hidden'))
}

export function Dialog ({
  actions,
  children,
  labelledBy,
  onClose,
  open = false,
  title
}) {
  const generatedId = useId()
  const titleId = labelledBy || 'reefpi-dialog-' + generatedId.replace(/:/g, '')
  const panelRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    previousFocusRef.current = document.activeElement
    const focusables = focusableElements(panelRef.current)
    ;(focusables[0] || panelRef.current)?.focus()

    return () => {
      previousFocusRef.current?.focus?.()
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  const handleKeyDown = event => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose?.()
      return
    }

    if (event.key !== 'Tab') return
    const focusables = focusableElements(panelRef.current)
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div
      className='reefpi-dialog-backdrop'
      role='presentation'
      style={{
        alignItems: 'center',
        background: 'rgba(31, 42, 31, 0.36)',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        padding: 'var(--reefpi-space-md)',
        position: 'fixed',
        zIndex: 1000
      }}
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <section
        aria-labelledby={titleId}
        aria-modal='true'
        className='reefpi-dialog'
        onKeyDown={handleKeyDown}
        ref={panelRef}
        role='dialog'
        tabIndex='-1'
        style={Object.assign({}, surfaceStyle, {
          display: 'grid',
          gap: 'var(--reefpi-space-md)',
          maxHeight: 'calc(100vh - 2rem)',
          maxWidth: '32rem',
          overflow: 'auto',
          padding: 'var(--reefpi-space-lg)',
          width: '100%'
        })}
      >
        {title && <h2 id={titleId} style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h2>}
        <div>{children}</div>
        {actions && <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)', justifyContent: 'flex-end' }}>{actions}</div>}
      </section>
    </div>,
    document.body
  )
}

function MenuItemButton ({ item }) {
  const handleSelect = event => {
    item.onSelect?.(event)
  }

  return (
    <button
      onClick={handleSelect}
      role='menuitem'
      style={Object.assign({}, actionButtonStyle, {
        borderColor: 'transparent',
        justifyContent: 'flex-start',
        width: '100%'
      })}
      type='button'
    >
      {item.label}
    </button>
  )
}

export function Menu ({
  buttonLabel,
  children,
  items = []
}) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handleMouseDown = event => {
      if (!menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  const focusItem = index => {
    const buttons = focusableElements(menuRef.current)
    buttons[index]?.focus()
  }

  const handleMenuKeyDown = event => {
    const buttons = focusableElements(menuRef.current)
    const current = buttons.indexOf(document.activeElement)
    if (event.key === 'Escape') {
      setOpen(false)
      buttonRef.current?.focus()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusItem((current + 1 + buttons.length) % buttons.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusItem((current - 1 + buttons.length) % buttons.length)
    }
  }

  return (
    <div className='reefpi-menu' style={{ display: 'inline-flex', position: 'relative' }}>
      <button
        aria-expanded={open}
        aria-haspopup='menu'
        onClick={() => setOpen(value => !value)}
        ref={buttonRef}
        style={actionButtonStyle}
        type='button'
      >
        {buttonLabel}
      </button>
      {open && (
        <div
          className='reefpi-menu-panel'
          onKeyDown={handleMenuKeyDown}
          ref={menuRef}
          role='menu'
          style={Object.assign({}, surfaceStyle, {
            display: 'grid',
            minWidth: '12rem',
            padding: 'var(--reefpi-space-xxs)',
            position: 'absolute',
            right: 0,
            top: 'calc(100% + var(--reefpi-space-xxs))',
            zIndex: 20
          })}
        >
          {children || items.map(item => <MenuItemButton item={item} key={item.label} />)}
        </div>
      )}
    </div>
  )
}

export function Tooltip ({ children, id, text }) {
  const generatedId = useId()
  const tooltipId = id || 'reefpi-tooltip-' + generatedId.replace(/:/g, '')
  const [open, setOpen] = useState(false)

  return (
    <span className='reefpi-tooltip' style={{ display: 'inline-flex', position: 'relative' }}>
      {React.isValidElement(children)
        ? React.cloneElement(children, {
          'aria-describedby': tooltipId,
          onBlur: event => { children.props.onBlur?.(event); setOpen(false) },
          onFocus: event => { children.props.onFocus?.(event); setOpen(true) },
          onMouseEnter: event => { children.props.onMouseEnter?.(event); setOpen(true) },
          onMouseLeave: event => { children.props.onMouseLeave?.(event); setOpen(false) }
        })
        : children}
      {open && (
        <span
          id={tooltipId}
          role='tooltip'
          style={Object.assign({}, surfaceStyle, {
            bottom: 'calc(100% + var(--reefpi-space-xxs))',
            fontSize: '0.75rem',
            maxWidth: '16rem',
            padding: 'var(--reefpi-space-xs)',
            position: 'absolute',
            right: 0,
            zIndex: 30
          })}
        >
          {text}
        </span>
      )}
    </span>
  )
}

export function Tabs ({ tabs = [], value, onChange }) {
  const [internalValue, setInternalValue] = useState(value || tabs[0]?.id)
  const activeValue = value || internalValue
  const activeIndex = Math.max(0, tabs.findIndex(tab => tab.id === activeValue))
  const activeTab = tabs[activeIndex]
  const tabRefs = useRef([])

  const select = next => {
    if (value === undefined) setInternalValue(next)
    onChange?.(next)
  }

  const handleKeyDown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    let nextIndex = activeIndex
    if (event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + tabs.length) % tabs.length
    if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    select(tabs[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className='reefpi-tabs'>
      <div aria-label='Tabs' onKeyDown={handleKeyDown} role='tablist' style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', overflowX: 'auto' }}>
        {tabs.map((tab, index) => {
          const selected = tab.id === activeValue
          return (
            <button
              aria-controls={'panel-' + tab.id}
              aria-selected={selected}
              id={'tab-' + tab.id}
              key={tab.id}
              onClick={() => select(tab.id)}
              ref={node => { tabRefs.current[index] = node }}
              role='tab'
              style={Object.assign({}, actionButtonStyle, selected
                ? {
                    background: 'var(--reefpi-color-brand)',
                    border: '1px solid var(--reefpi-color-brand)',
                    color: 'var(--reefpi-color-nav-text-strong)'
                  }
                : null)}
              tabIndex={selected ? 0 : -1}
              type='button'
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      {activeTab && (
        <section
          aria-labelledby={'tab-' + activeTab.id}
          id={'panel-' + activeTab.id}
          role='tabpanel'
          style={Object.assign({}, surfaceStyle, { marginTop: 'var(--reefpi-space-sm)', padding: 'var(--reefpi-space-md)' })}
        >
          {activeTab.panel}
        </section>
      )}
    </div>
  )
}

Dialog.propTypes = {
  actions: PropTypes.node,
  children: PropTypes.node,
  labelledBy: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.node
}

MenuItemButton.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.node.isRequired,
    onSelect: PropTypes.func
  }).isRequired
}

Menu.propTypes = {
  buttonLabel: PropTypes.node.isRequired,
  children: PropTypes.node,
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.node.isRequired,
    onSelect: PropTypes.func
  }))
}

Tooltip.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
  text: PropTypes.node.isRequired
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    panel: PropTypes.node
  })),
  value: PropTypes.string,
  onChange: PropTypes.func
}
