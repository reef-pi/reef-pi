import React from 'react'
import { logError } from '../utils/log'

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { error: null, errorInfo: null, currentTab: props.tab }
  }

  static getDerivedStateFromProps (props, state) {
    if (props.tab === state.currentTab) {
      return null
    }
    state.error = null
    state.errorInfo = null
    state.currentTab = props.tab
    return state
  }

  componentDidCatch (error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    logError(error)
  }

  render () {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }
    // Normally, just render children
    return this.props.children
  }
}

export default ErrorBoundary
