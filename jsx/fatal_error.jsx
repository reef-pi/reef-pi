import React from 'react'
import { FaMedkit } from 'react-icons/fa'
const RefreshTime = 4000
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
    let that = this
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
                    <div className='card-header'>Fatal Error</div>
                    <div className='card-body'>
                      <h5 className='card-title'>Connection Lost</h5>
                      <p className='card-text'>
                        Something went wrong and the UI cannot contact the server anymore. You may need to restart the
                        webserver or do some troubleshooting.
                      </p>
                      <p className='card-text'>
                        <a
                          target='_blank'
                          href='http://reef-pi.com/additional-documentation/troubleshooting/'
                          className='btn btn-primary mr-2'
                        >
                          {FaMedkit()} Troubleshoot
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
