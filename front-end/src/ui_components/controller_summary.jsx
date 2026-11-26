import React from 'react'
import PropTypes from 'prop-types'

const displayValue = value => {
  if (value === undefined || value === null || value === '') return '—'
  return value
}

export default function ControllerSummary ({ children, sections }) {
  return (
    <div className='reefpi-controller-summary'>
      {children}
      <div className='reefpi-controller-summary__sections'>
        {sections.map(section => (
          <section className='reefpi-controller-summary__section' key={section.title}>
            <h3>{section.title}</h3>
            <dl>
              {section.items.map(item => (
                <div className='reefpi-controller-summary__item' key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{displayValue(item.value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}

ControllerSummary.propTypes = {
  children: PropTypes.node,
  sections: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.node
    })).isRequired
  })).isRequired
}
