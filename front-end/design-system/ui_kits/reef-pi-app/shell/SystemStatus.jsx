import React from 'react'
import PropTypes from 'prop-types'

/*
 * Controller status for the navigation (Aquatic Precision #3289). Replaces the fixed footer:
 * the error count is the one signal worth seeing all the time; time, version, uptime, IP and the
 * API/documentation links sit behind "System details". It never claims the controller is healthy:
 * with no errors it says exactly that, in a neutral tone.
 *
 * compact: the collapsed rail shows only the error link (count in its accessible name).
 */

const DEFAULT_LABELS = {
  title: 'Controller status',
  noErrors: 'No errors logged',
  errorCount: count => `Errors: ${count}`,
  details: 'System details',
  time: 'Controller time',
  version: 'Version',
  uptime: 'Up since',
  ip: 'IP address',
  api: 'API',
  documentation: 'Documentation',
  devMode: 'In DevMode'
}

export default function SystemStatus ({
  info = {},
  errorCount = 0,
  devMode = false,
  compact = false,
  labels = {},
  errorsHref = '/configuration/errors',
  apiHref = '/assets/api.html',
  docsHref = 'http://reef-pi.com'
}) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const tone = errorCount > 0 ? 'error' : 'neutral'
  const errorText = errorCount > 0 ? l.errorCount(errorCount) : l.noErrors

  if (compact) {
    return (
      <section className='reefpi-status reefpi-status--compact' aria-label={l.title}>
        <a className={`reefpi-status-errors reefpi-status-errors--${tone}`} href={errorsHref} aria-label={errorText} title={errorText}>
          <StatusIcon tone={tone} />
          {errorCount > 0 && <span className='reefpi-status-count' aria-hidden='true'>{errorCount > 99 ? '99+' : errorCount}</span>}
        </a>
        {devMode && <span className='reefpi-status-dev reefpi-status-dev--dot' title={l.devMode} aria-label={l.devMode} role='img' />}
      </section>
    )
  }

  return (
    <section className='reefpi-status' aria-label={l.title}>
      <a className={`reefpi-status-errors reefpi-status-errors--${tone}`} href={errorsHref}>
        <StatusIcon tone={tone} />
        <span>{errorText}</span>
      </a>
      {devMode && <span className='reefpi-status-dev'>{l.devMode}</span>}
      <details className='reefpi-status-details'>
        <summary>{l.details}</summary>
        <dl>
          <dt>{l.time}</dt><dd>{info.current_time || '—'}</dd>
          <dt>{l.version}</dt><dd>{[info.version, info.model].filter(Boolean).join(' · ') || '—'}</dd>
          <dt>{l.uptime}</dt><dd>{info.uptime || '—'}</dd>
          <dt>{l.ip}</dt><dd className='reefpi-status-mono'>{info.ip || '—'}</dd>
        </dl>
        <p className='reefpi-status-links'>
          <a href={apiHref}>{l.api}</a>
          <a href={docsHref} target='_blank' rel='noopener noreferrer'>{l.documentation}</a>
        </p>
      </details>
    </section>
  )
}

function StatusIcon ({ tone }) {
  return (
    <svg className='reefpi-status-icon' width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' aria-hidden='true'>
      {tone === 'error'
        ? <><path d='M8 1.75 14.5 13.5h-13z' strokeLinejoin='round' /><path d='M8 6v3.25M8 11.25v.01' /></>
        : <><circle cx='8' cy='8' r='6.25' /><path d='M5.5 8h5' /></>}
    </svg>
  )
}

StatusIcon.propTypes = { tone: PropTypes.oneOf(['error', 'neutral']).isRequired }

SystemStatus.propTypes = {
  info: PropTypes.object,
  errorCount: PropTypes.number,
  devMode: PropTypes.bool,
  compact: PropTypes.bool,
  labels: PropTypes.object,
  errorsHref: PropTypes.string,
  apiHref: PropTypes.string,
  docsHref: PropTypes.string
}
