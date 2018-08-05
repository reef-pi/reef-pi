import React from 'react'
import PropTypes from 'prop-types'

export default class WaitStepConfig extends React.Component {
  constructor (props) {
    super(props)
    this.update = this.update.bind(this)
  }

  update (ev) {
    this.props.hook({
      duration: parseInt(ev.target.value)
    })
  }

  render () {
    return (
      <div className='row'>
        <div className='input-group col'>
          <div className='input-group-text col-lg-4'>
            <input
              type='text'
              name={this.props.macro_id + '-' + this.props.index + '-step-wait-duration'}
              disabled={this.props.readOnly}
              onChange={this.update}
              value={this.props.duration}
              className='container'
              id={this.props.macro_id + '-' + this.props.index + '-step-wait-duration'}
            />
          </div>
          <label className='input-group-append'>seconds</label>
        </div>
      </div>
    )
  }
}

WaitStepConfig.propTypes = {
  hook: PropTypes.func,
  readOnly: PropTypes.bool,
  macro_id: PropTypes.string,
  index: PropTypes.number,
  on: PropTypes.bool,
  duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}
