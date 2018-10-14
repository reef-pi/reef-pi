import React from 'react'
import PropTypes from 'prop-types'
import SelectType from './select_type'
import GenericStepConfig from './generic_step_config'
import WaitStepConfig from './wait_step_config'

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
    var config = <div />
    switch (this.props.type) {
      case 'wait':
        config = <WaitStepConfig
          hook={this.updateConfig}
          readOnly={this.props.readOnly}
          macro_id={this.props.macro_id}
          index={this.props.index}
          duration={this.props.config.duration}
        />
        break
      default:
        config = <GenericStepConfig
          type={this.props.type}
          hook={this.updateConfig}
          active={this.props.config.id}
          readOnly={this.props.readOnly}
          macro_id={this.props.macro_id}
          index={this.props.index}
          on={this.props.config.on}
        />
    }

    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>
            <SelectType
              type={this.props.type}
              hook={this.updateType}
              readOnly={this.props.readOnly}
              macro_id={this.props.macro_id}
              index={this.props.index}
            />
          </div>
          <div className='col'>
            {config}
          </div>
          <div className='col'>
            <button
              className='btn btn-outline-danger'
              onClick={this.props.delete}
              disabled={this.props.readOnly}
            >
              X
            </button>
          </div>
        </div>
      </div>
    )
  }
}

Step.propTypes = {
  hook: PropTypes.func,
  delete: PropTypes.func,
  config: PropTypes.object,
  type: PropTypes.string,
  readOnly: PropTypes.bool,
  macro_id: PropTypes.string,
  index: PropTypes.number
}
