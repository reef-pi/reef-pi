import React from 'react'
import { logError } from '../utils/log'

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { error: null, errorInfo: null, currentTab: props.tab }
  }

  UNSAFE_componentWillReceiveProps ({ tab }) {
    if (tab !== this.state.currentTab) {
      this.setState({ error: null, errorInfo: null, currentTab: tab })
    }
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
