import React from 'react'
import { FaMedkit } from 'react-icons/fa'
import i18next from 'i18next'
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
    fetch('/api/me', {
      method: 'GET',
      credentials: 'same-origin'
    })
      .then(r => {
        that.setState({ up: r.ok })
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
        <div className='fatal-error-container'>
          <div className='fatal-error-background' />
          <div className='fatal-error-content'>
            <div className='container h-100'>
              <div className='row align-items-center h-100'>
                <div className='col' />
                <div className='col-12 col-md-8 col-lg-6'>
                  <div className='card text-white bg-danger mb-3'>
                    <div className='card-header'>{i18next.t('fatal_error:fatal_error')}</div>
                    <div className='card-body'>
                      <h5 className='card-title'>{i18next.t('fatal_error:connection_lost')}</h5>
                      <p className='card-text'>
                        {i18next.t('fatal_error:message')}
                      </p>
                      <p className='card-text'>
                        <a
                          target='_blank' rel='noopener noreferrer'
                          href='http://reef-pi.com/additional-documentation/troubleshooting/'
                          className='btn btn-primary mr-2'
                        >
                          {FaMedkit()} {i18next.t('fatal_error:troubleshoot')}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
                <div className='col' />
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}
