import React from 'react'
import PropTypes from 'prop-types'

export default class Step extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.configUI = this.configUI.bind(this)
  }

  configUI () {
    switch (this.props.type) {
      case 'wait':
        return (<span>{this.props.config.duration} seconds</span>)
      default:
        return (
          <div className='row'>
            <div className='col'>ID: {this.props.config.id}</div>
            <div className='col'>On: {this.props.config.on}</div>
          </div>
        )
    }
  }

  render () {
    return (
      <div className='row'>
        <div className='col'>{this.props.type}</div>
        <div className='col'>{this.configUI()}</div>
      </div>
    )
  }
}

Step.propTypes = {
  hook: PropTypes.func,
  config: PropTypes.object,
  type: PropTypes.string
}
