import React from 'react'
import PropTypes from 'prop-types'

export default class FixedProfile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      v: props.config.value ? props.config.value : 0
    }
    this.update = this.update.bind(this)
  }
  update (ev) {
    this.setState({v: parseInt(ev.target.value)})
    this.props.hook({value: parseInt(ev.target.value)})
  }

  render () {
    return (
      <div className='row'>
        <div className='col-lg-1 col-xs-1'>{this.state.v}</div>
        <input
          className='col-lg-9 col-xs-9'
          type='range'
          onChange={this.update}
          value={this.state.v}
          disabled={this.props.readOnly}
        />
      </div>
    )
  }
}

FixedProfile.propTypes = {
  config: PropTypes.object,
  hook: PropTypes.func,
  readOnly: PropTypes.bool
}
