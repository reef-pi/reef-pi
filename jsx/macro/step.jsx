import React from 'react'
import PropTypes from 'prop-types'
import SelectType from './select_type'
import StepConfig from './step_config'

export default class Step extends React.Component {
  constructor (props) {
    super(props)
    this.configUI = this.configUI.bind(this)
    this.updateType = this.updateType.bind(this)
    this.updateConfig = this.updateConfig.bind(this)
  }

  updateType (k) {
    this.props.hook({type: k, config: this.props.config})
  }

  updateConfig (c) {
    this.props.hook({
      type: this.props.type,
      config: c
    })
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
        <div className='col'>
          <SelectType
            type={this.props.type}
            hook={this.updateType}
            readOnly={this.props.readOnly}
          />
        </div>
        <div className='col'>
          <StepConfig
            type={this.props.type}
            hook={this.updateConfig}
            active={this.props.config.id}
            readOnly={this.props.readOnly}
          />
        </div>
      </div>
    )
  }
}

Step.propTypes = {
  hook: PropTypes.func,
  config: PropTypes.object,
  type: PropTypes.string,
  readOnly: PropTypes.bool
}
