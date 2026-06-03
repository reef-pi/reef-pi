import React from 'react'
import { FaMedkit } from 'react-icons/fa'
import i18next from 'i18next'
import { isSignedIn } from './session_api'
const RefreshTime = 10000
export default class FatalError extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      up: true
    }
  }

  componentDidMount () {
    this.timer = setInterval(() => {
      this.checkHealth()
    }, RefreshTime)
  }

  componentWillUnmount () {
    window.clearInterval(this.timer)
  }

  checkHealth () {
    const that = this
    isSignedIn()
      .then(up => {
        that.setState({ up })
      })
      .catch(() => {
        that.setState({ up: false })
      })
  }

  render () {
    if (this.state.up) {
      return null
    } else {
      return (
        <div className='fatal-error-wrap'>
          <div className='fatal-error-background' />
          <div className='fatal-error-content'>
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', padding: '1rem' }}>
              <div style={{ maxWidth: '36rem', width: '100%' }}>
                <div style={{
                  background: 'var(--reefpi-danger)',
                  color: 'var(--reefpi-white)',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}
                >
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', fontWeight: 600 }}>
                    {i18next.t('fatal_error:fatal_error')}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h5 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{i18next.t('fatal_error:connection_lost')}</h5>
                    <p style={{ marginBottom: '0.5rem' }}>
                      {i18next.t('fatal_error:message')}
                    </p>
                    <p style={{ marginBottom: 0 }}>
                      <a
                        target='_blank' rel='noopener noreferrer'
                        href='http://reef-pi.com/additional-documentation/troubleshooting/'
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.9rem',
                          background: 'var(--reefpi-primary)',
                          color: 'var(--reefpi-white)',
                          borderRadius: '0.375rem',
                          textDecoration: 'none',
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        {FaMedkit()} {i18next.t('fatal_error:troubleshoot')}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}
