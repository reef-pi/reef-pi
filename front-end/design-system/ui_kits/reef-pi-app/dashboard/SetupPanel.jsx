import React from 'react'
import PropTypes from 'prop-types'
import i18n from 'utils/i18n'

const descriptionStyle = {
  color: 'var(--reefpi-color-text-muted)',
  fontSize: 'var(--reefpi-font-size-label)',
  margin: 0
}

const linkStyle = {
  alignItems: 'center',
  border: '1px solid var(--reefpi-color-border)',
  borderRadius: 'var(--reefpi-radius-sm)',
  color: 'var(--reefpi-color-text)',
  display: 'inline-flex',
  fontSize: 'var(--reefpi-font-size-label)',
  fontWeight: 600,
  justifyContent: 'center',
  minHeight: 'var(--reefpi-tap-target-min)',
  padding: '0 var(--reefpi-space-sm)',
  textDecoration: 'none'
}

export default function SetupPanel ({ items = [] }) {
  if (!items.length) return null

  return (
    <section className='reefpi-setup-panel' aria-labelledby='dashboard-setup-title' data-testid='dashboard-setup'>
      <div>
        <h2 id='dashboard-setup-title' style={{ fontSize: '1.125rem', margin: 0 }}>
          {i18n.t('dashboard:setup_heading', { defaultValue: 'Finish setup' })}
        </h2>
        <p style={descriptionStyle}>
          {i18n.t('dashboard:setup_intro', { defaultValue: 'Add the controller features you plan to use.' })}
        </p>
      </div>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <p style={descriptionStyle}>{item.description}</p>
            <a href={item.href} style={linkStyle}>{item.title}</a>
          </li>
        ))}
      </ul>
    </section>
  )
}

SetupPanel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired
  }))
}
